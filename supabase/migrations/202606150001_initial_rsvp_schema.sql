create extension if not exists pgcrypto;

create table public.events (
  id text primary key check (id in ('haldi', 'wedding', 'vratham')),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue text not null,
  address text not null
);

create table public.guest_groups (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  invitation_token text not null unique
    default encode(gen_random_bytes(18), 'hex'),
  created_at timestamptz not null default now()
);

create table public.invitation_events (
  guest_group_id uuid not null references public.guest_groups(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  primary key (guest_group_id, event_id)
);

create table public.rsvp_contacts (
  guest_group_id uuid primary key references public.guest_groups(id) on delete cascade,
  guest_name text not null,
  email text,
  phone text,
  updated_at timestamptz not null default now(),
  check (nullif(trim(email), '') is not null or nullif(trim(phone), '') is not null)
);

create table public.event_responses (
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
  );

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

create or replace function public.get_invitation(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
$$;

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
as $$
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
$$;

revoke all on function public.get_invitation(text) from public;
revoke all on function public.save_rsvp(text, text, text, text, jsonb) from public;

grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.save_rsvp(text, text, text, text, jsonb)
  to anon, authenticated;
