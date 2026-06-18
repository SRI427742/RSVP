create extension if not exists pgcrypto;

create table if not exists public.events (
  id text primary key check (id in ('haldi', 'wedding', 'vratham')),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue text not null,
  address text not null
);

create table if not exists public.guest_groups (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  invitation_token text not null unique
    default encode(gen_random_bytes(18), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.invitation_events (
  guest_group_id uuid not null references public.guest_groups(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  primary key (guest_group_id, event_id)
);

create table if not exists public.rsvp_contacts (
  guest_group_id uuid primary key references public.guest_groups(id) on delete cascade,
  guest_name text not null,
  email text,
  phone text,
  updated_at timestamptz not null default now(),
  check (nullif(trim(email), '') is not null or nullif(trim(phone), '') is not null)
);

create table if not exists public.event_responses (
  guest_group_id uuid not null references public.guest_groups(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  attending boolean not null,
  guest_count integer not null default 1 check (guest_count >= 1),
  additional_names text not null default '',
  updated_at timestamptz not null default now(),
  primary key (guest_group_id, event_id)
);

insert into public.events (id, name, starts_at, ends_at, venue, address)
values
  (
    'haldi',
    'Haldi',
    '2026-08-27 10:00:00-05',
    '2026-08-27 21:00:00-05',
    'Belfort Residence',
    '10208 Belfort Dr, Frisco, TX 75035'
  ),
  (
    'wedding',
    'Wedding',
    '2026-08-28 09:00:00-05',
    '2026-08-28 15:00:00-05',
    'Prism Las Colinas',
    '350 E Royal Ln, Ste 123, Irving, TX 75039'
  ),
  (
    'vratham',
    'Vratham',
    '2026-08-29 08:00:00-05',
    '2026-08-29 12:00:00-05',
    'Mercer Parkway Residence',
    '1850 Mercer Pkwy, Farmers Branch, TX 75234'
  )
on conflict (id) do update
set
  name = excluded.name,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  venue = excluded.venue,
  address = excluded.address;

alter table public.events enable row level security;
alter table public.guest_groups enable row level security;
alter table public.invitation_events enable row level security;
alter table public.rsvp_contacts enable row level security;
alter table public.event_responses enable row level security;

revoke all on public.events from anon, authenticated;
revoke all on public.guest_groups from anon, authenticated;
revoke all on public.invitation_events from anon, authenticated;
revoke all on public.rsvp_contacts from anon, authenticated;
revoke all on public.event_responses from anon, authenticated;
