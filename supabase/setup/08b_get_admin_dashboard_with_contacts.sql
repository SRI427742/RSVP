create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_result jsonb;
begin
  if not public.is_rsvp_admin() then
    raise exception 'Administrator access required';
  end if;

  select jsonb_build_object(
    'guestGroups',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', gg.id,
            'displayName', gg.display_name,
            'token', gg.invitation_token,
            'inviteEmail', coalesce(gg.invite_email, ''),
            'invitePhone', coalesce(gg.invite_phone, ''),
            'createdAt', gg.created_at,
            'eventIds', coalesce(
              (
                select jsonb_agg(ie.event_id order by e.starts_at)
                from public.invitation_events ie
                join public.events e on e.id = ie.event_id
                where ie.guest_group_id = gg.id
              ),
              '[]'::jsonb
            ),
            'contact',
              case
                when rc.guest_group_id is null then null
                else jsonb_build_object(
                  'guestName', rc.guest_name,
                  'email', coalesce(rc.email, ''),
                  'phone', coalesce(rc.phone, ''),
                  'updatedAt', rc.updated_at
                )
              end,
            'responses', coalesce(
              (
                select jsonb_object_agg(
                  er.event_id,
                  jsonb_build_object(
                    'attending', er.attending,
                    'guestCount', er.guest_count,
                    'additionalNames', er.additional_names,
                    'updatedAt', er.updated_at
                  )
                )
                from public.event_responses er
                where er.guest_group_id = gg.id
              ),
              '{}'::jsonb
            )
          )
          order by gg.created_at desc
        )
        from public.guest_groups gg
        left join public.rsvp_contacts rc on rc.guest_group_id = gg.id
      ),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$function$;
