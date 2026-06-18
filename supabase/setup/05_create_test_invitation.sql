with test_group as (
  insert into public.guest_groups (display_name, invitation_token)
  values (
    'RSVP Test Group',
    'af463161dfc05beb7ecc964a0c552acac26f'
  )
  on conflict (invitation_token) do update
  set display_name = excluded.display_name
  returning id, invitation_token
),
assigned_events as (
  insert into public.invitation_events (guest_group_id, event_id)
  select test_group.id, events.id
  from test_group
  cross join public.events
  on conflict do nothing
)
select
  'http://localhost:5173/?invite=' || invitation_token
    as local_test_url,
  invitation_token
from test_group;
