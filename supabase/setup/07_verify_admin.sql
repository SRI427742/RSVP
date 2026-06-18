select
  exists (
    select 1
    from public.admin_users
    where email = 'gollasriharsha19@gmail.com'
  ) as admin_email_ready,
  to_regprocedure('public.is_rsvp_admin()') is not null
    as admin_check_ready,
  to_regprocedure('public.get_admin_dashboard()') is not null
    as dashboard_ready,
  to_regprocedure('public.create_guest_group(text,text[])') is not null
    as create_guest_ready,
  to_regprocedure('public.delete_guest_group(uuid)') is not null
    as delete_guest_ready;
