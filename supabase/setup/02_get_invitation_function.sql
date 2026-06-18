create or replace function public.get_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_group_id uuid;
  v_result jsonb;
begin
  select id
  into v_group_id
  from public.guest_groups
  where invitation_token = p_token;

  if v_group_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'token', p_token,
    'eventIds', coalesce(
      (
        select jsonb_agg(ie.event_id order by e.starts_at)
        from public.invitation_events ie
        join public.events e on e.id = ie.event_id
        where ie.guest_group_id = v_group_id
      ),
      '[]'::jsonb
    ),
    'response',
      case
        when rc.guest_group_id is null then null
        else jsonb_build_object(
          'guestName', rc.guest_name,
          'email', coalesce(rc.email, ''),
          'phone', coalesce(rc.phone, ''),
          'submittedAt', rc.updated_at,
          'events', coalesce(
            (
              select jsonb_object_agg(
                er.event_id,
                jsonb_build_object(
                  'attending', case when er.attending then 'yes' else 'no' end,
                  'guestCount', er.guest_count,
                  'additionalNames', er.additional_names
                )
              )
              from public.event_responses er
              where er.guest_group_id = v_group_id
            ),
            '{}'::jsonb
          )
        )
      end
  )
  into v_result
  from public.guest_groups gg
  left join public.rsvp_contacts rc on rc.guest_group_id = gg.id
  where gg.id = v_group_id;

  return v_result;
end;
$function$;

revoke all on function public.get_invitation(text) from public;
grant execute on function public.get_invitation(text) to anon, authenticated;
