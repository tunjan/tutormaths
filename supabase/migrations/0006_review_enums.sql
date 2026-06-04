-- ============================================================================
-- TutorMaths — review workflow enums.
-- Kept in their own migration so the new notification_type values are committed
-- before the 0007 migration (and runtime) reference them. ALTER TYPE ... ADD
-- VALUE cannot use a value it adds within the same transaction.
-- ============================================================================
create type public.review_status as enum (
  'assigned',    -- assigned, nothing under review
  'submitted',   -- student submitted work; awaiting tutor review
  'approved',    -- tutor approved the work
  'needs_work'   -- tutor returned the work for revision
);

alter type public.notification_type add value if not exists 'work_approved';
alter type public.notification_type add value if not exists 'work_returned';
