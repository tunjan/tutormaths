-- ============================================================================
-- TutorMaths — Step 13: Multiple attachments per assignment.
--   Assignments previously held exactly one file in `assignments.file_path`.
--   This normalises attachments into a 1:N `assignment_files` table (mirroring
--   the `submissions` shape), backfills the existing single file, and makes
--   `assignments.file_path` nullable (kept for legacy; no new code writes it).
--   Storage bucket, path convention and bucket RLS are unchanged.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. assignment_files  (1:N attachments; references assignments)
-- ----------------------------------------------------------------------------
create table public.assignment_files (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  file_path     text not null,                       -- object key in `assignment-files`
  mime_type     text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes    bigint check (size_bytes is null or size_bytes <= 20971520), -- 20 MB
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);

create index assignment_files_assignment_id_idx on public.assignment_files (assignment_id);

-- ----------------------------------------------------------------------------
-- 2. RLS  (mirrors the assignments/comments access matrix)
-- ----------------------------------------------------------------------------
alter table public.assignment_files enable row level security;

create policy "tutor full access to assignment files" on public.assignment_files
  for all to authenticated
  using      (public.is_tutor())
  with check (public.is_tutor());

create policy "student reads files on own assignments" on public.assignment_files
  for select to authenticated
  using (
    exists (
      select 1 from public.assignments a
      where a.id = assignment_id and a.student_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 3. Backfill the existing single file into the new table.
-- ----------------------------------------------------------------------------
insert into public.assignment_files (assignment_id, file_path, mime_type, sort_order)
select id,
       file_path,
       case
         when lower(file_path) like '%.png'                                  then 'image/png'
         when lower(file_path) like '%.jpg' or lower(file_path) like '%.jpeg' then 'image/jpeg'
         else 'application/pdf'
       end,
       0
from public.assignments
where file_path is not null;

-- ----------------------------------------------------------------------------
-- 4. file_path is now derived data — drop the NOT NULL so new assignments need
--    not write it. The guard_assignment_update trigger still references it, but
--    the value no longer changes, so the trigger is left untouched.
-- ----------------------------------------------------------------------------
alter table public.assignments alter column file_path drop not null;

-- ============================================================================
-- End of Step 13.
-- ============================================================================
