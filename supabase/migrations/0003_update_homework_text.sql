-- Update request_more_homework function to say "practice" instead of "homework"
create or replace function public.request_more_homework()
returns void
language plpgsql
security definer
as $$
declare
  v_student uuid := auth.uid();
  v_tutor uuid;
  v_name text;
begin
  if v_student is null then
    raise exception 'Not authenticated';
  end if;

  select tutor_id, full_name into v_tutor, v_name
  from public.users
  where id = v_student;

  if v_tutor is null then
    raise exception 'No tutor assigned';
  end if;

  insert into public.notifications (user_id, type, message)
  values (v_tutor, 'homework_requested',
          coalesce(v_name, 'A student') || ' requested more practice');
end;
$$;
