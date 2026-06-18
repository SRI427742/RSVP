drop function if exists public.create_guest_group(text, text[]);

create or replace function public.create_guest_group(
  p_display_name text,
  p_invite_email text,
  p_invite_phone text,
  p_event_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_group public.guest_groups;
  v_event_id text;
begin
  if not public.is_rsvp_admin() then
    raise exception 'Administrator access required';
  end if;

  if nullif(trim(p_display_name), '') is null then
    raise exception 'Group name is required';
  end if;

  if nullif(trim(p_invite_email), '') is null
    and nullif(trim(p_invite_phone), '') is null then
    raise exception 'Email or phone is required';
  end if;

  if nullif(trim(p_invite_email), '') is not null
    and trim(p_invite_email) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'Email is not valid';
  end if;

  if nullif(trim(p_invite_phone), '') is not null
    and length(regexp_replace(p_invite_phone, '[^0-9]', '', 'g')) < 7
  then
    raise exception 'Phone is not valid';
  end if;

  if coalesce(array_length(p_event_ids, 1), 0) = 0 then
    raise exception 'Select at least one event';
  end if;

  insert into public.guest_groups (
    display_name,
    invite_email,
    invite_phone
  )
  values (
    trim(p_display_name),
    nullif(trim(p_invite_email), ''),
    nullif(trim(p_invite_phone), '')
  )
  returning * into v_group;

  foreach v_event_id in array p_event_ids
  loop
    if v_event_id not in ('haldi', 'wedding', 'vratham') then
      raise exception 'Invalid event';
    end if;

    insert into public.invitation_events (guest_group_id, event_id)
    values (v_group.id, v_event_id);
  end loop;

  return jsonb_build_object(
    'id', v_group.id,
    'displayName', v_group.display_name,
    'token', v_group.invitation_token,
    'inviteEmail', coalesce(v_group.invite_email, ''),
    'invitePhone', coalesce(v_group.invite_phone, ''),
    'eventIds', to_jsonb(p_event_ids),
    'createdAt', v_group.created_at
  );
end;
$function$;
