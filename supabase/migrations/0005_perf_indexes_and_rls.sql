-- ============================================================================
-- TutorMaths — performance hardening (addresses Supabase performance advisor).
--   1. Covering indexes for foreign keys that lacked them.
--   2. Recreate RLS policies wrapping auth.uid() / is_tutor() in a scalar
--      sub-select so they are evaluated ONCE per query instead of per row
--      (the auth_rls_initplan optimisation), and consolidate the overlapping
--      tutor/self policies on profiles.
-- Semantics are unchanged.
-- ============================================================================

-- 1. Covering indexes for unindexed foreign keys -----------------------------
create index if not exists assignments_tutor_id_idx       on public.assignments  (tutor_id);
create index if not exists comments_author_id_idx         on public.comments     (author_id);
create index if not exists notifications_assignment_id_idx on public.notifications (assignment_id);
create index if not exists reminders_sent_student_id_idx  on public.reminders_sent (student_id);
create index if not exists submissions_student_id_idx     on public.submissions  (student_id);

-- 2. Recreate policies with (select …) wrapping ------------------------------

-- profiles (consolidate tutor + self into one policy per action) -------------
drop policy if exists "tutor reads all profiles"  on public.profiles;
drop policy if exists "user reads own profile"    on public.profiles;
drop policy if exists "user updates own profile"  on public.profiles;
drop policy if exists "tutor updates any profile" on public.profiles;

create policy "read profiles" on public.profiles
  for select to authenticated
  using ((select public.is_tutor()) or id = (select auth.uid()));

create policy "update profiles" on public.profiles
  for update to authenticated
  using ((select public.is_tutor()) or id = (select auth.uid()))
  with check ((select public.is_tutor()) or id = (select auth.uid()));

-- tutor_settings -------------------------------------------------------------
drop policy if exists "tutor manages own settings" on public.tutor_settings;
create policy "tutor manages own settings" on public.tutor_settings
  for all to authenticated
  using      ((select public.is_tutor()) and tutor_id = (select auth.uid()))
  with check ((select public.is_tutor()) and tutor_id = (select auth.uid()));

-- assignments ----------------------------------------------------------------
drop policy if exists "tutor full access to assignments" on public.assignments;
drop policy if exists "student reads own assignments"    on public.assignments;
drop policy if exists "student updates own assignment"   on public.assignments;

create policy "tutor full access to assignments" on public.assignments
  for all to authenticated
  using ((select public.is_tutor())) with check ((select public.is_tutor()));

create policy "student reads own assignments" on public.assignments
  for select to authenticated using (student_id = (select auth.uid()));

create policy "student updates own assignment" on public.assignments
  for update to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

-- submissions ----------------------------------------------------------------
drop policy if exists "tutor reads all submissions"     on public.submissions;
drop policy if exists "student reads own submissions"   on public.submissions;
drop policy if exists "student inserts own submissions" on public.submissions;
drop policy if exists "student deletes own submissions" on public.submissions;

create policy "tutor reads all submissions" on public.submissions
  for select to authenticated using ((select public.is_tutor()));

create policy "student reads own submissions" on public.submissions
  for select to authenticated using (student_id = (select auth.uid()));

create policy "student inserts own submissions" on public.submissions
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = (select auth.uid())
    )
  );

create policy "student deletes own submissions" on public.submissions
  for delete to authenticated using (student_id = (select auth.uid()));

-- comments -------------------------------------------------------------------
drop policy if exists "tutor full access to comments"               on public.comments;
drop policy if exists "student reads comments on own assignments"   on public.comments;
drop policy if exists "student inserts comments on own assignments" on public.comments;

create policy "tutor full access to comments" on public.comments
  for all to authenticated
  using ((select public.is_tutor())) with check ((select public.is_tutor()));

create policy "student reads comments on own assignments" on public.comments
  for select to authenticated
  using (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = (select auth.uid())
    )
  );

create policy "student inserts comments on own assignments" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = (select auth.uid())
    )
  );

-- notifications --------------------------------------------------------------
drop policy if exists "recipient reads own notifications"   on public.notifications;
drop policy if exists "recipient updates own notifications" on public.notifications;

create policy "recipient reads own notifications" on public.notifications
  for select to authenticated using (recipient_id = (select auth.uid()));

create policy "recipient updates own notifications" on public.notifications
  for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));

-- reminders_sent -------------------------------------------------------------
drop policy if exists "tutor reads reminders_sent" on public.reminders_sent;
create policy "tutor reads reminders_sent" on public.reminders_sent
  for select to authenticated using ((select public.is_tutor()));
