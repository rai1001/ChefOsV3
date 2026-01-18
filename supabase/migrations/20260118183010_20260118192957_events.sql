-- Enums
create type public.event_status as enum ('draft', 'confirmed', 'cancelled');
create type public.event_service_type as enum ('coffee_break', 'dinner', 'production');
create type public.event_service_format as enum ('de_pie', 'sentado');

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id),
  hotel_id uuid not null references public.hotels (id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- Spaces
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id),
  hotel_id uuid not null references public.hotels (id),
  name text not null,
  created_at timestamptz not null default now()
);

-- Space bookings
create table public.space_bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id),
  event_id uuid not null references public.events (id),
  space_id uuid not null references public.spaces (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Event services
create table public.event_services (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id),
  event_id uuid not null references public.events (id),
  service_type public.event_service_type not null,
  format public.event_service_format not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.events enable row level security;
alter table public.spaces enable row level security;
alter table public.space_bookings enable row level security;
alter table public.event_services enable row level security;

create policy "Events readable by members" on public.events
  for select using (is_org_member(org_id));
create policy "Events writable by members" on public.events
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "Service role manages events" on public.events
  for all to service_role using (true) with check (true);

create policy "Spaces readable by members" on public.spaces
  for select using (is_org_member(org_id));
create policy "Spaces writable by members" on public.spaces
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "Service role manages spaces" on public.spaces
  for all to service_role using (true) with check (true);

create policy "Bookings readable by members" on public.space_bookings
  for select using (is_org_member(org_id));
create policy "Bookings writable by members" on public.space_bookings
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "Service role manages bookings" on public.space_bookings
  for all to service_role using (true) with check (true);

create policy "Event services readable by members" on public.event_services
  for select using (is_org_member(org_id));
create policy "Event services writable by members" on public.event_services
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "Service role manages event services" on public.event_services
  for all to service_role using (true) with check (true);

-- Seed mínima ligada a org/hotel seed
do $$
declare
  seed_org uuid := '11111111-1111-4111-8111-111111111111';
  seed_hotel uuid := '22222222-2222-4222-8222-222222222222';
begin
  if exists (select 1 from public.orgs where id = seed_org)
     and exists (select 1 from public.hotels where id = seed_hotel) then
    insert into public.events (id, org_id, hotel_id, title, starts_at, ends_at, status)
    values (
      '77777777-7777-4777-8777-777777777777',
      seed_org,
      seed_hotel,
      'Evento demo',
      now() + interval '1 day',
      now() + interval '1 day' + interval '3 hours',
      'confirmed'
    )
    on conflict (id) do nothing;

    insert into public.spaces (id, org_id, hotel_id, name)
    values (
      '88888888-8888-4888-8888-888888888888',
      seed_org,
      seed_hotel,
      'Sala principal'
    )
    on conflict (id) do nothing;

    insert into public.space_bookings (id, org_id, event_id, space_id, starts_at, ends_at)
    values (
      '99999999-9999-4999-8999-999999999999',
      seed_org,
      '77777777-7777-4777-8777-777777777777',
      '88888888-8888-4888-8888-888888888888',
      now() + interval '1 day',
      now() + interval '1 day' + interval '3 hours'
    )
    on conflict (id) do nothing;

    insert into public.event_services (id, org_id, event_id, service_type, format)
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      seed_org,
      '77777777-7777-4777-8777-777777777777',
      'dinner',
      'sentado'
    )
    on conflict (id) do nothing;
  end if;
end $$;
