-- ============================================================================
-- TutorMaths — Step 12: Allow image uploads for assignments.
--   The `assignment-files` bucket previously only accepted PDFs. This adds
--   JPEG and PNG so tutors can assign image-based worksheets and problem sets.
-- ============================================================================

update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png']
where id = 'assignment-files';

-- ============================================================================
-- End of Step 12.
-- ============================================================================
