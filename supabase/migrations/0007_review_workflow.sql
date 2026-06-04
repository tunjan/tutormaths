-- ============================================================================
-- TutorMaths — review workflow.
-- completion_pct stays the student's self-report; review_status is the tutor's
-- verdict and the source of truth for "done" on the tutor side. Also turns on
-- Realtime for comments so an open thread updates live for both parties.
-- ============================================================================

alter table public.assignments
  add column if not exists review_status public.review_status not null default 'assigned',
  add column if not exists reviewed_at   timestamptz;

create index if not exists assignments_review_status_idx
  on public.assignments (review_status);

-- ----------------------------------------------------------------------------
-- Guard trigger — students may change completion_pct, and may only move
-- review_status to 'submitted' (which happens automatically on submission).
-- reviewed_at and approve/return remain tutor-only. Defense-in-depth behind RLS.
-- ----------------------------------------------------------------------------
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
    if new.review_status is distinct from old.review_status
       and new.review_status <> 'submitted' then
      raise exception 'Students may not set review status';
    end if;
    if new.reviewed_at is distinct from old.reviewed_at then
      raise exception 'Students may not set reviewed_at';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- On a new submission: notify the tutor AND move the assignment into the
-- review queue (review_status = 'submitted'), even if it was previously
-- approved (re-submitted work needs a fresh look).
-- ----------------------------------------------------------------------------
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

  update public.assignments
     set review_status = 'submitted'
   where id = new.assignment_id
     and review_status is distinct from 'submitted';

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- When the tutor approves or returns work, notify the student.
-- ----------------------------------------------------------------------------
create or replace function public.notify_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.review_status is distinct from old.review_status
     and new.review_status in ('approved', 'needs_work') then
    insert into public.notifications (recipient_id, type, assignment_id, body)
    values (
      new.student_id,
      case when new.review_status = 'approved'
           then 'work_approved'::public.notification_type
           else 'work_returned'::public.notification_type end,
      new.id,
      case when new.review_status = 'approved'
           then 'Your tutor approved your work on "' || new.title || '"'
           else 'Your tutor asked for changes on "' || new.title || '"' end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_review on public.assignments;
create trigger trg_notify_review
  after update on public.assignments
  for each row execute function public.notify_review();

-- ----------------------------------------------------------------------------
-- Realtime on comments so an open assignment thread updates live for both
-- parties. The existing RLS SELECT policies still scope what each client sees.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;
end $$;
