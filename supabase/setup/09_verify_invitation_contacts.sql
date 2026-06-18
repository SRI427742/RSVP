select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guest_groups'
      and column_name = 'invite_email'
  ) as invite_email_ready,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guest_groups'
      and column_name = 'invite_phone'
  ) as invite_phone_ready,
  to_regprocedure(
    'public.create_guest_group(text,text,text,text[])'
  ) is not null as create_guest_with_contact_ready;
