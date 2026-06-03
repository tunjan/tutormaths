-- ============================================================================
-- TutorMaths — schedule the reminder Edge Function with pg_cron.
--
-- PREREQUISITES (do these first, see SETUP.md "Step 5"):
--   1. Deploy the `send-reminders` Edge Function.
--   2. Set its secrets: RESEND_API_KEY and RESEND_FROM_EMAIL.
--      (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
--   3. Store the service-role key in Vault so cron can authenticate the call —
--      run ONCE, replacing the placeholder with your real key:
--
--        select vault.create_secret('<SERVICE_ROLE_KEY>', 'reminder_invoker_key');
--
--      To rotate later:
--        select vault.update_secret(
--          (select id from vault.secrets where name = 'reminder_invoker_key'),
--          '<NEW_SERVICE_ROLE_KEY>'
--        );
--
-- The cron job runs on a FIXED interval (every 15 minutes); the function itself
-- decides which reminders are due and dedupes via reminders_sent.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- (Re)schedule the job. Scheduling by name replaces any existing job of that
-- name. The service-role key is read from Vault, never stored in plaintext here.
select cron.schedule(
  'send-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url     := 'https://oahyvncrknjnusphwfti.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization',
        'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'reminder_invoker_key'
        )
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- To remove the schedule later:
--   select cron.unschedule('send-reminders');
