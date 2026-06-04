-- ============================================================================
-- TutorMaths — email every in-app notification.
--
-- Every row inserted into public.notifications is already delivered in-app via
-- Realtime. This adds an AFTER INSERT trigger that ALSO emails the recipient,
-- by calling the `send-notification-email` Edge Function with pg_net.
--
-- Why pg_net (async http_post): the call is enqueued and sent by a background
-- worker AFTER the surrounding transaction commits. So it never blocks or
-- fails the action that created the notification (assigning work, commenting,
-- etc.), and if that transaction rolls back, no email is sent.
--
-- 'reminder' notifications are skipped here — send-reminders already emails
-- them, so emailing again would double up.
--
-- PREREQUISITES (see SETUP.md "Step 6"):
--   1. Deploy the function:  supabase functions deploy send-notification-email
--   2. Its secrets RESEND_API_KEY / RESEND_FROM_EMAIL are shared with
--      send-reminders; optionally set SITE_URL for deep links in the email.
--   3. The service-role key must already be in Vault as 'reminder_invoker_key'
--      (created in Step 5 for the reminder cron) — reused here to authenticate
--      the function call.
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.email_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  -- send-reminders owns the email for reminders; don't double-send.
  if new.type = 'reminder' then
    return new;
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'reminder_invoker_key';

  -- Not configured yet: the in-app notification still stands, just no email.
  if v_key is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://oahyvncrknjnusphwfti.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'id', new.id,
      'recipient_id', new.recipient_id,
      'type', new.type,
      'assignment_id', new.assignment_id,
      'body', new.body
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_email_notification on public.notifications;
create trigger trg_email_notification
  after insert on public.notifications
  for each row execute function public.email_notification();
