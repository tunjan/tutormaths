-- Queue assignments for students who have an outstanding invitation. They are
-- promoted to ordinary assignments, atomically, as soon as the invite is
-- redeemed. Until then only the tutor who created the invite can see them.

create table public.pending_assignments (
  id          uuid primary key,
  invite_id   uuid not null references public.student_invites (id) on delete cascade,
  tutor_id    uuid not null references public.profiles (id) on delete cascade,
  type        public.assignment_type not null,
  title       text not null,
  description text,
  file_path   text,
  due_at      timestamptz not null,
  latex_body  text,
  category_id uuid references public.categories (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint pending_assignments_has_content
    check (file_path is not null or nullif(btrim(latex_body), '') is not null)
);

create index pending_assignments_invite_id_idx
  on public.pending_assignments (invite_id);

create table public.pending_assignment_files (
  id                    uuid primary key default gen_random_uuid(),
  pending_assignment_id uuid not null references public.pending_assignments (id) on delete cascade,
  file_path             text not null,
  mime_type             text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes            bigint check (size_bytes is null or size_bytes <= 20971520),
  sort_order            int not null default 0,
  created_at            timestamptz not null default now()
);

alter table public.pending_assignments enable row level security;
alter table public.pending_assignment_files enable row level security;

create policy "tutor manages own pending assignments"
  on public.pending_assignments for all to authenticated
  using ((select public.is_tutor()) and tutor_id = (select auth.uid()))
  with check (
    (select public.is_tutor())
    and tutor_id = (select auth.uid())
    and exists (
      select 1 from public.student_invites i
      where i.id = invite_id
        and i.created_by = (select auth.uid())
        and i.accepted_at is null
    )
  );

create policy "tutor manages own pending assignment files"
  on public.pending_assignment_files for all to authenticated
  using (
    exists (
      select 1 from public.pending_assignments p
      where p.id = pending_assignment_id
        and p.tutor_id = (select auth.uid())
        and (select public.is_tutor())
    )
  )
  with check (
    exists (
      select 1 from public.pending_assignments p
      where p.id = pending_assignment_id
        and p.tutor_id = (select auth.uid())
        and (select public.is_tutor())
    )
  );

-- File access is tied to the assignment row, rather than trusting the first
-- storage path segment. This also lets queued files keep their original path
-- after the invite is accepted without exposing them to another student.
drop policy if exists "student reads own assignment files" on storage.objects;
create policy "student reads assigned files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assignment-files'
    and exists (
      select 1
      from public.assignment_files f
      join public.assignments a on a.id = f.assignment_id
      where f.file_path = name and a.student_id = (select auth.uid())
    )
  );

-- Service-role-only RPC used after Auth has created the student's profile.
-- The insert fires the normal assignment notification trigger.
create or replace function public.redeem_pending_assignments(
  p_invite_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.student_invites
    where id = p_invite_id and accepted_user_id = p_student_id
  ) then
    raise exception 'Invite is not linked to this student';
  end if;

  insert into public.assignments (
    id, tutor_id, student_id, type, title, description, file_path,
    due_at, latex_body, category_id, created_at
  )
  select id, tutor_id, p_student_id, type, title, description, file_path,
         due_at, latex_body, category_id, created_at
  from public.pending_assignments
  where invite_id = p_invite_id;

  insert into public.assignment_files (
    assignment_id, file_path, mime_type, size_bytes, sort_order, created_at
  )
  select f.pending_assignment_id, f.file_path, f.mime_type, f.size_bytes,
         f.sort_order, f.created_at
  from public.pending_assignment_files f
  join public.pending_assignments p on p.id = f.pending_assignment_id
  where p.invite_id = p_invite_id;

  delete from public.pending_assignments where invite_id = p_invite_id;
end;
$$;

revoke all on function public.redeem_pending_assignments(uuid, uuid) from public, anon, authenticated;
grant execute on function public.redeem_pending_assignments(uuid, uuid) to service_role;
