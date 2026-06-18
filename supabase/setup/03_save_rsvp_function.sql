create or replace function public.save_rsvp(
  p_token text,
  p_guest_name text,
  p_email text,
  p_phone text,
  p_responses jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_group_id uuid;
  v_response jsonb;
  v_event_id text;
begin
  select id
  into v_group_id
  from public.guest_groups
  where invitation_token = p_token;

  if v_group_id is null then
    raise exception 'Invitation not found';
  end if;

  if nullif(trim(p_guest_name), '') is null then
    raise exception 'Guest name is required';
  end if;

  if nullif(trim(p_email), '') is null and nullif(trim(p_phone), '') is null then
    raise exception 'Email or phone is required';
  end if;

  if jsonb_typeof(p_responses) <> 'object' then
    raise exception 'Event responses must be an object';
  end if;

  if (
    select count(*)
    from jsonb_object_keys(p_responses)
  ) <> (
    select count(*)
    from public.invitation_events
    where guest_group_id = v_group_id
  ) then
    raise exception 'A response is required for every invited event';
  end if;

  insert into public.rsvp_contacts (
    guest_group_id,
    guest_name,
    email,
    phone,
    updated_at
  )
  values (
    v_group_id,
    trim(p_guest_name),
    nullif(trim(p_email), ''),
    nullif(trim(p_phone), ''),
    now()
  )
  on conflict (guest_group_id) do update
  set
    guest_name = excluded.guest_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  for v_event_id, v_response in
    select key, value
    from jsonb_each(p_responses)
  loop
    if not exists (
      select 1
      from public.invitation_events
      where guest_group_id = v_group_id
        and event_id = v_event_id
    ) then
      raise exception 'Event is not part of this invitation';
    end if;

    if coalesce(v_response->>'attending', '') not in ('yes', 'no') then
      raise exception 'Attendance must be yes or no';
    end if;

    insert into public.event_responses (
      guest_group_id,
      event_id,
      attending,
      guest_count,
      additional_names,
      updated_at
    )
    values (
      v_group_id,
      v_event_id,
      (v_response->>'attending') = 'yes',
      greatest(coalesce((v_response->>'guestCount')::integer, 1), 1),
      coalesce(v_response->>'additionalNames', ''),
      now()
    )
    on conflict (guest_group_id, event_id) do update
    set
      attending = excluded.attending,
      guest_count = excluded.guest_count,
      additional_names = excluded.additional_names,
      updated_at = now();
  end loop;

  return public.get_invitation(p_token)->'response';
end;
$function$;

revoke all on function public.save_rsvp(text, text, text, text, jsonb)
  from public;
grant execute on function public.save_rsvp(text, text, text, text, jsonb)
  to anon, authenticated;
