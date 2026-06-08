-- ============================================================================
-- TutorMaths — student "opened" read receipt.
-- Records the first time a student opens an assignment so the tutor can see
-- that their task has been seen. Set once (null -> timestamp) by the student
-- the first time they view the assignment; never reset afterwards.
-- ============================================================================

alter table public.assignments
  add column if not exists student_opened_at timestamptz;

-- ----------------------------------------------------------------------------
-- Guard trigger — students may change completion_pct, may move review_status to
-- 'submitted', and may stamp student_opened_at exactly once (from null).
-- Everything else stays tutor-only. Defense-in-depth behind RLS.
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
    -- The open receipt is write-once: a student may stamp it but not clear or
    -- backdate it once set.
    if old.student_opened_at is not null
       and new.student_opened_at is distinct from old.student_opened_at then
      raise exception 'Students may not change student_opened_at once set';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
