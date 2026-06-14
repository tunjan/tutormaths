-- ============================================================================
-- Allow students to attach an optional free-text message when requesting more
-- practice. The message is trimmed, length-capped, and appended to the
-- tutor's notification body.
-- ============================================================================

-- The signature changes (gains an optional parameter), so drop the old one
-- first to avoid an ambiguous overload when called with no arguments.
drop function if exists public.request_more_homework();

create or replace function public.request_more_homework(p_message text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor uuid;
  v_name  text;
  v_msg   text;
  v_body  text;
begin
  select id into v_tutor from public.profiles where role = 'tutor' limit 1;
  select nullif(full_name, '') into v_name from public.profiles where id = auth.uid();

  v_msg  := nullif(btrim(p_message), '');
  v_body := coalesce(v_name, 'A student') || ' requested more practice';

  if v_msg is not null then
    v_body := v_body || ': ' || left(v_msg, 500);
  end if;

  insert into public.notifications (recipient_id, type, body)
  values (v_tutor, 'homework_requested', v_body);
end;
$$;

revoke execute on function public.request_more_homework(text) from anon, public;
grant  execute on function public.request_more_homework(text) to authenticated;
