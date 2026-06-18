select
  (select count(*) from public.events) as event_count,
  to_regclass('public.guest_groups') is not null as guest_groups_ready,
  to_regclass('public.invitation_events') is not null as invitations_ready,
  to_regclass('public.rsvp_contacts') is not null as contacts_ready,
  to_regclass('public.event_responses') is not null as responses_ready,
  to_regprocedure('public.get_invitation(text)') is not null
    as get_invitation_ready,
  to_regprocedure(
    'public.save_rsvp(text,text,text,text,jsonb)'
  ) is not null as save_rsvp_ready;
