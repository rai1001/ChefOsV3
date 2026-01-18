-- Storage bucket for attachments
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Table to reference event attachments
create table if not exists public.event_attachments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id),
  event_id uuid null,
  path text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

alter table public.event_attachments enable row level security;

-- RLS helper check: member of org
create policy "Event attachments readable by org members"
  on public.event_attachments
  for select
  using (public.is_org_member(org_id));

create policy "Event attachments insertable by org members"
  on public.event_attachments
  for insert
  with check (public.is_org_member(org_id));

create policy "Event attachments deletable by org members"
  on public.event_attachments
  for delete
  using (public.is_org_member(org_id));

-- Storage policies for bucket attachments
-- Allow org members to upload/list/delete their own org scoped objects (path prefix org_id/)
create policy "attachments org members can upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'org_id')
  );

create policy "attachments org members can read"
  on storage.objects
  for select
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'org_id')
  );

create policy "attachments org members can delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (auth.jwt() ->> 'org_id')
  );

-- Seed minimal attachment for seed org (if events exist)
do $$
declare
  seed_org uuid := '11111111-1111-4111-8111-111111111111';
  seed_event uuid;
begin
  if to_regclass('public.events') is not null then
    select id into seed_event from public.events where org_id = seed_org limit 1;
  end if;

  if seed_event is not null then
    insert into public.event_attachments (org_id, event_id, path, mime_type, size_bytes)
    values (seed_org, seed_event, concat(seed_org::text, '/demo.txt'), 'text/plain', 12)
    on conflict do nothing;
  end if;
end $$;
