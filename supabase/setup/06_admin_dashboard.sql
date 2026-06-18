create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email)
values ('gollasriharsha19@gmail.com')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_rsvp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$function$;

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

create or replace function public.create_guest_group(
  p_display_name text,
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

  if coalesce(array_length(p_event_ids, 1), 0) = 0 then
    raise exception 'Select at least one event';
  end if;

  insert into public.guest_groups (display_name)
  values (trim(p_display_name))
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
    'eventIds', to_jsonb(p_event_ids),
    'createdAt', v_group.created_at
  );
end;
$function$;

create or replace function public.delete_guest_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_rsvp_admin() then
    raise exception 'Administrator access required';
  end if;

  delete from public.guest_groups where id = p_group_id;
end;
$function$;

revoke all on function public.is_rsvp_admin() from public;
revoke all on function public.get_admin_dashboard() from public;
revoke all on function public.create_guest_group(text, text[]) from public;
revoke all on function public.delete_guest_group(uuid) from public;

grant execute on function public.is_rsvp_admin() to authenticated;
grant execute on function public.get_admin_dashboard() to authenticated;
grant execute on function public.create_guest_group(text, text[])
  to authenticated;
grant execute on function public.delete_guest_group(uuid) to authenticated;
