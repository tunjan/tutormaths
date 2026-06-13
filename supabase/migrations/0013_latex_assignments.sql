-- ============================================================================
-- TutorMaths — Step 13: Allow LaTeX/Markdown assignments.
--   Tutors can now type a problem set as Markdown with inline ($...$) and
--   display ($$...$$) maths instead of uploading a PDF/image. An assignment
--   therefore has EITHER an attached file OR a latex_body — never neither.
-- ============================================================================

alter table public.assignments
  add column latex_body text;

-- A file is no longer mandatory now that the body can be typed inline.
alter table public.assignments
  alter column file_path drop not null;

-- But every assignment must carry content of some kind.
alter table public.assignments
  add constraint assignments_has_content
  check (file_path is not null or latex_body is not null);

-- ============================================================================
-- End of Step 13.
-- ============================================================================
