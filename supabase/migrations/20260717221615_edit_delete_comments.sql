-- Comment access is participant-scoped, while mutations are author-only.
-- Split the legacy tutor FOR ALL policy so tutors cannot edit or delete a
-- student's message through the Data API.
alter table public.comments
  add column if not exists deleted_at timestamptz;

drop policy if exists "tutor full access to comments" on public.comments;
drop policy if exists "student reads comments on own assignments" on public.comments;
drop policy if exists "student inserts comments on own assignments" on public.comments;
drop policy if exists "participants read comments" on public.comments;
drop policy if exists "participants add own comments" on public.comments;
drop policy if exists "authors edit own comments" on public.comments;
drop policy if exists "authors delete own comments" on public.comments;

create policy "participants read comments" on public.comments
  for select to authenticated
  using (
    exists (
      select 1
      from public.assignments a
      where a.id = comments.assignment_id
        and (select auth.uid()) in (a.tutor_id, a.student_id)
    )
  );

create policy "participants add own comments" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = comments.assignment_id
        and (select auth.uid()) in (a.tutor_id, a.student_id)
    )
  );

create policy "authors edit own comments" on public.comments
  for update to authenticated
  using (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = comments.assignment_id
        and (select auth.uid()) in (a.tutor_id, a.student_id)
    )
  )
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = comments.assignment_id
        and (select auth.uid()) in (a.tutor_id, a.student_id)
    )
  );

create policy "authors delete own comments" on public.comments
  for delete to authenticated
  using (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.assignments a
      where a.id = comments.assignment_id
        and (select auth.uid()) in (a.tutor_id, a.student_id)
    )
  );

-- Only the body and the short-lived delete tombstone are editable. Ownership,
-- assignment, timestamp, and ID remain immutable even if a caller bypasses the
-- app and uses the Data API.
revoke update on public.comments from authenticated;
grant select, insert, delete on public.comments to authenticated;
grant update (body, deleted_at) on public.comments to authenticated;
