-- ============================================================================
-- TutorMaths — Step 1 hardening (addresses Supabase security advisor warnings)
--   1. Pin search_path on functions that were missing it.
--   2. Revoke EXECUTE on trigger-only / internal SECURITY DEFINER functions so
--      they are not reachable as PostgREST RPC endpoints. Triggers still fire
--      (trigger invocation does not check the caller's EXECUTE privilege).
-- request_more_homework keeps authenticated EXECUTE — it is an intentional RPC.
-- custom_access_token_hook keeps supabase_auth_admin EXECUTE — set in 0001.
-- ============================================================================

-- 1. Pin search_path (these reference only schema-qualified objects).
alter function public.is_tutor()                       set search_path = public;
alter function public.custom_access_token_hook(jsonb)  set search_path = public;
alter function public.guard_assignment_update()        set search_path = public;

-- 2. Lock down trigger-only / internal functions from the public API.
revoke execute on function public.notify_assignment_created() from public, anon, authenticated;
revoke execute on function public.notify_completion_change()  from public, anon, authenticated;
revoke execute on function public.notify_submission()         from public, anon, authenticated;
revoke execute on function public.notify_comment()            from public, anon, authenticated;
revoke execute on function public.guard_assignment_update()   from public, anon, authenticated;
revoke execute on function public.handle_new_user()           from public, anon, authenticated;
