alter table public.guest_groups
  add column if not exists invite_email text,
  add column if not exists invite_phone text;

alter table public.guest_groups
  drop constraint if exists guest_groups_invite_contact_check;

alter table public.guest_groups
  add constraint guest_groups_invite_contact_check
  check (
    nullif(trim(invite_email), '') is not null
    or nullif(trim(invite_phone), '') is not null
  ) not valid;
