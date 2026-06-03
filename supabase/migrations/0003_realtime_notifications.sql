-- ============================================================================
-- TutorMaths — enable Supabase Realtime on notifications.
-- The recipient's RLS SELECT policy still applies, so a client only receives
-- its own notifications. We subscribe to INSERTs (default replica identity is
-- sufficient for INSERT payloads).
-- ============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
