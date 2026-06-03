-- ============================================================================
-- TutorMaths — Step 1: Schema, role claim hook, RLS, storage, triggers
-- Run this whole file in the Supabase SQL Editor (or via `supabase db push`).
-- Ordering: extensions → enums → tables (FK-dependency order) → role helper
--           → access-token hook → RLS policies → guard/notify triggers
--           → new-user trigger → storage buckets + storage policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
-- gen_random_uuid() is in core Postgres (>=13) on Supabase; pgcrypto kept for safety.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
create type public.assignment_type as enum ('problem_set', 'reading_notes');

create type public.notification_type as enum (
  'assignment_created',   -- tutor assigned a task            -> student
  'tutor_comment',        -- tutor commented                 -> student
  'student_comment',      -- student commented               -> tutor
  'submission_updated',   -- student submitted/updated work  -> tutor
  'homework_requested',   -- student asked for more homework -> tutor
  'reminder'              -- scheduled due-date reminder      -> student
);

-- ----------------------------------------------------------------------------
-- 2. profiles  (extends auth.users; holds the role used by the JWT hook)
--    FK-root table: referenced by everything else, so it comes first.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'student' check (role in ('tutor', 'student')),
  full_name  text not null default '',
  email      text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. role drives the user_role JWT claim via the access-token hook.';

-- ----------------------------------------------------------------------------
-- 3. tutor_settings  (configurable reminder windows; references profiles)
-- ----------------------------------------------------------------------------
create table public.tutor_settings (
  tutor_id         uuid primary key references public.profiles (id) on delete cascade,
  reminder_windows int[] not null default '{48,24,6}',  -- hours before due
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. assignments  (references profiles twice: tutor + student)
--    completion_pct is the SINGLE source of progress; there is no done boolean.
-- ----------------------------------------------------------------------------
create table public.assignments (
  id             uuid primary key default gen_random_uuid(),
  tutor_id       uuid not null references public.profiles (id) on delete cascade,
  student_id     uuid not null references public.profiles (id) on delete cascade,
  type           public.assignment_type not null,
  title          text not null,
  description    text,
  file_path      text not null,                       -- object key in `assignment-files`
  due_at         timestamptz not null,
  completion_pct int  not null default 0 check (completion_pct between 0 and 100),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index assignments_student_id_idx on public.assignments (student_id);
create index assignments_due_at_idx     on public.assignments (due_at);

-- ----------------------------------------------------------------------------
-- 5. submissions  (student work; references assignments + profiles)
-- ----------------------------------------------------------------------------
create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  file_path     text not null,                        -- object key in `submissions`
  mime_type     text not null check (mime_type in ('application/pdf', 'image/jpeg')),
  size_bytes    bigint check (size_bytes is null or size_bytes <= 20971520), -- 20 MB
  created_at    timestamptz not null default now()
);

create index submissions_assignment_id_idx on public.submissions (assignment_id);

-- ----------------------------------------------------------------------------
-- 6. comments  (on assignments; references assignments + profiles)
-- ----------------------------------------------------------------------------
create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  author_id     uuid not null references public.profiles (id) on delete cascade,
  body          text not null check (length(trim(body)) > 0),
  created_at    timestamptz not null default now()
);

create index comments_assignment_id_idx on public.comments (assignment_id);

-- ----------------------------------------------------------------------------
-- 7. notifications  (in-app; references profiles + optional assignment)
-- ----------------------------------------------------------------------------
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type         public.notification_type not null,
  assignment_id uuid references public.assignments (id) on delete cascade,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

-- ----------------------------------------------------------------------------
-- 8. reminders_sent  (dedupe ledger for the scheduled reminder function)
-- ----------------------------------------------------------------------------
create table public.reminders_sent (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  window_hours  int  not null,
  sent_at       timestamptz not null default now(),
  unique (assignment_id, student_id, window_hours)   -- the dedupe guarantee
);

-- ============================================================================
-- 9. Role helper — reads the role from the JWT claim, NEVER from a table.
--    Non-recursive: safe to call inside RLS policies (no in-table lookup).
-- ============================================================================
create or replace function public.is_tutor()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'user_role', '') = 'tutor';
$$;

-- ============================================================================
-- 10. Custom access-token auth hook — injects user_role into every JWT.
--     Runs as the supabase_auth_admin role, so that role needs read access
--     to public.profiles (granted below). Enable it in Step 2 via the
--     dashboard: Authentication → Hooks → Customize Access Token (JWT) Claims.
-- ============================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  v_role    text;
begin
  select role into v_role from public.profiles where id = (event ->> 'user_id')::uuid;

  claims := event -> 'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(v_role, 'student')));
  event  := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

-- Permissions for the hook: only supabase_auth_admin may execute it / read roles.
grant usage   on schema public                          to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
grant select  on public.profiles                        to supabase_auth_admin;

-- ============================================================================
-- 11. Enable RLS on every table
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.tutor_settings enable row level security;
alter table public.assignments    enable row level security;
alter table public.submissions    enable row level security;
alter table public.comments       enable row level security;
alter table public.notifications  enable row level security;
alter table public.reminders_sent enable row level security;

-- ---- profiles -------------------------------------------------------------
-- The auth hook (running as supabase_auth_admin) must read roles.
create policy "auth admin reads profiles" on public.profiles
  for select to supabase_auth_admin using (true);

create policy "tutor reads all profiles" on public.profiles
  for select to authenticated using (public.is_tutor());

create policy "user reads own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "user updates own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "tutor updates any profile" on public.profiles
  for update to authenticated using (public.is_tutor()) with check (public.is_tutor());
-- INSERT is intentionally NOT granted: rows are created by the SECURITY DEFINER
-- handle_new_user() trigger (section 14), which bypasses RLS.

-- ---- tutor_settings -------------------------------------------------------
create policy "tutor manages own settings" on public.tutor_settings
  for all to authenticated
  using      (public.is_tutor() and tutor_id = auth.uid())
  with check (public.is_tutor() and tutor_id = auth.uid());

-- ---- assignments ----------------------------------------------------------
create policy "tutor full access to assignments" on public.assignments
  for all to authenticated
  using      (public.is_tutor())
  with check (public.is_tutor());

create policy "student reads own assignments" on public.assignments
  for select to authenticated using (student_id = auth.uid());

-- Students may UPDATE their own rows; a guard trigger (section 13) restricts
-- the change to completion_pct only (RLS cannot scope to columns by row).
create policy "student updates own assignment" on public.assignments
  for update to authenticated
  using      (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ---- submissions ----------------------------------------------------------
create policy "tutor reads all submissions" on public.submissions
  for select to authenticated using (public.is_tutor());

create policy "student reads own submissions" on public.submissions
  for select to authenticated using (student_id = auth.uid());

create policy "student inserts own submissions" on public.submissions
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = auth.uid()
    )
  );

create policy "student deletes own submissions" on public.submissions
  for delete to authenticated using (student_id = auth.uid());

-- ---- comments -------------------------------------------------------------
create policy "tutor full access to comments" on public.comments
  for all to authenticated
  using      (public.is_tutor())
  with check (public.is_tutor());

create policy "student reads comments on own assignments" on public.comments
  for select to authenticated
  using (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = auth.uid()
    )
  );

create policy "student inserts comments on own assignments" on public.comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = auth.uid()
    )
  );

-- ---- notifications --------------------------------------------------------
-- Reads/updates only by the recipient. INSERTs come from SECURITY DEFINER
-- triggers / RPC (sections 12 & 15) or the service-role reminder function.
create policy "recipient reads own notifications" on public.notifications
  for select to authenticated using (recipient_id = auth.uid());

create policy "recipient updates own notifications" on public.notifications
  for update to authenticated
  using      (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- ---- reminders_sent -------------------------------------------------------
-- Read-only to the tutor; writes happen via the service-role edge function.
create policy "tutor reads reminders_sent" on public.reminders_sent
  for select to authenticated using (public.is_tutor());

-- ============================================================================
-- 12. Notification event triggers (the event → recipient matrix)
--     SECURITY DEFINER so they may insert into notifications despite RLS.
-- ============================================================================

-- Tutor assigns a new task -> notify the assigned student.
create or replace function public.notify_assignment_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, type, assignment_id, body)
  values (new.student_id, 'assignment_created', new.id,
          'New assignment: ' || new.title);
  return new;
end;
$$;

create trigger trg_notify_assignment_created
  after insert on public.assignments
  for each row execute function public.notify_assignment_created();

-- Student updates progress (completion_pct) -> notify tutor.
create or replace function public.notify_completion_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.completion_pct is distinct from old.completion_pct then
    insert into public.notifications (recipient_id, type, assignment_id, body)
    values (new.tutor_id, 'submission_updated', new.id,
            'Progress on "' || new.title || '" set to ' || new.completion_pct || '%');
  end if;
  return new;
end;
$$;

create trigger trg_notify_completion_change
  after update on public.assignments
  for each row execute function public.notify_completion_change();

-- Student submits/uploads work -> notify tutor.
create or replace function public.notify_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor uuid;
  v_title text;
begin
  select tutor_id, title into v_tutor, v_title
  from public.assignments where id = new.assignment_id;

  insert into public.notifications (recipient_id, type, assignment_id, body)
  values (v_tutor, 'submission_updated', new.assignment_id,
          'New work submitted for "' || v_title || '"');
  return new;
end;
$$;

create trigger trg_notify_submission
  after insert on public.submissions
  for each row execute function public.notify_submission();

-- Comment posted -> notify the OTHER party (tutor ↔ student).
create or replace function public.notify_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor   uuid;
  v_student uuid;
  v_title   text;
  v_role    text;
begin
  select tutor_id, student_id, title into v_tutor, v_student, v_title
  from public.assignments where id = new.assignment_id;

  select role into v_role from public.profiles where id = new.author_id;

  if v_role = 'tutor' then
    insert into public.notifications (recipient_id, type, assignment_id, body)
    values (v_student, 'tutor_comment', new.assignment_id,
            'Your tutor commented on "' || v_title || '"');
  else
    insert into public.notifications (recipient_id, type, assignment_id, body)
    values (v_tutor, 'student_comment', new.assignment_id,
            'New comment on "' || v_title || '"');
  end if;
  return new;
end;
$$;

create trigger trg_notify_comment
  after insert on public.comments
  for each row execute function public.notify_comment();

-- ============================================================================
-- 13. Guard trigger — students may only change completion_pct.
--     Defense-in-depth behind the "student updates own assignment" policy.
--     Also keeps updated_at fresh on every update.
-- ============================================================================
create or replace function public.guard_assignment_update()
returns trigger
language plpgsql
as $$
begin
  if not public.is_tutor() then
    if (new.tutor_id,  new.student_id, new.type,  new.title,
        new.description, new.file_path, new.due_at, new.created_at)
       is distinct from
       (old.tutor_id,  old.student_id, old.type,  old.title,
        old.description, old.file_path, old.due_at, old.created_at)
    then
      raise exception 'Students may only update completion_pct';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_guard_assignment_update
  before update on public.assignments
  for each row execute function public.guard_assignment_update();

-- ============================================================================
-- 14. New-user trigger — creates the profile row and assigns the tutor role.
--     The single tutor account is recognised by email. EDIT the email below
--     to your tutor email before running (pre-filled from your environment).
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  v_role := case
    when new.email = 'albertomedinatrigo@gmail.com' then 'tutor'
    else 'student'
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_role
  );

  if v_role = 'tutor' then
    insert into public.tutor_settings (tutor_id)
    values (new.id)
    on conflict (tutor_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 15. "Request more homework" RPC — student-callable; notifies the tutor.
--     SECURITY DEFINER so it may write a notification despite RLS.
-- ============================================================================
create or replace function public.request_more_homework()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor uuid;
  v_name  text;
begin
  select id into v_tutor from public.profiles where role = 'tutor' limit 1;
  select nullif(full_name, '') into v_name from public.profiles where id = auth.uid();

  insert into public.notifications (recipient_id, type, body)
  values (v_tutor, 'homework_requested',
          coalesce(v_name, 'A student') || ' requested more homework');
end;
$$;

revoke execute on function public.request_more_homework() from anon, public;
grant  execute on function public.request_more_homework() to authenticated;

-- ============================================================================
-- 16. Storage buckets (PRIVATE) + their RLS policies on storage.objects.
--     Path convention: BOTH buckets key objects under "{student_id}/..."
--       assignment-files/{student_id}/{assignment_id}/{filename}
--       submissions/{student_id}/{assignment_id}/{filename}
--     so (storage.foldername(name))[1] = the owning student's uid.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('assignment-files', 'assignment-files', false, 20971520, array['application/pdf']),
  ('submissions',      'submissions',      false, 20971520, array['application/pdf', 'image/jpeg'])
on conflict (id) do nothing;

-- ---- assignment-files: tutor writes/reads all; assigned student reads own ---
create policy "tutor manages assignment files" on storage.objects
  for all to authenticated
  using      (bucket_id = 'assignment-files' and public.is_tutor())
  with check (bucket_id = 'assignment-files' and public.is_tutor());

create policy "student reads own assignment files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assignment-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---- submissions: student manages own folder; tutor reads all --------------
-- A student's SELECT only matches their own folder, so no student can ever
-- read another student's submission.
create policy "student manages own submissions" on storage.objects
  for all to authenticated
  using      (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tutor reads submissions" on storage.objects
  for select to authenticated
  using (bucket_id = 'submissions' and public.is_tutor());

-- ============================================================================
-- End of Step 1.
-- ============================================================================
