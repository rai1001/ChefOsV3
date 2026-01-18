-- Base schema: organizaciones, membresías y hoteles
create extension if not exists "pgcrypto";

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null
);

create table if not exists public.org_members (
  org_id uuid references public.orgs(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  is_active boolean default true,
  primary key (org_id, user_id)
);

create index if not exists org_members_user_id_idx on public.org_members (user_id);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null
);

-- Helper para RLS
create or replace function public.is_org_member(org uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(
    select 1
    from public.org_members m
    where m.org_id = org
      and m.user_id = auth.uid()
      and coalesce(m.is_active, true)
  );
$$;

-- RLS
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.hotels enable row level security;

-- Policies
create policy "Org members can read orgs"
  on public.orgs
  for select
  using (is_org_member(id));

create policy "Service role can manage orgs"
  on public.orgs
  for all
  to service_role
  using (true)
  with check (true);

create policy "Members read their memberships"
  on public.org_members
  for select
  using (auth.uid() = user_id and is_org_member(org_id));

create policy "Service role manages memberships"
  on public.org_members
  for all
  to service_role
  using (true)
  with check (true);

create policy "Members read hotels of their org"
  on public.hotels
  for select
  using (is_org_member(org_id));

create policy "Service role manages hotels"
  on public.hotels
  for all
  to service_role
  using (true)
  with check (true);
