begin;

create table if not exists public.infographics (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  source_type text not null check (source_type in ('paper', 'github')),
  title text not null,
  original_url text not null,
  infographic_url text not null,
  summary text,
  authors text,
  repository text,
  stars integer,
  tags text[] default '{}' not null,
  published_at timestamptz,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.infographics enable row level security;

drop policy if exists "Infographics are viewable by everyone" on public.infographics;

create policy "Infographics are viewable by everyone"
  on public.infographics for select using (true);

revoke insert, update, delete on table public.infographics from anon, authenticated;

create index if not exists idx_infographics_source_type
  on public.infographics(source_type, published_at desc nulls last, created_at desc);

create index if not exists idx_infographics_published_at
  on public.infographics(published_at desc nulls last, created_at desc);

create index if not exists idx_infographics_featured
  on public.infographics(is_featured, published_at desc nulls last);

create or replace function public.set_infographics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_infographics_updated_at on public.infographics;

create trigger trg_infographics_updated_at
before update on public.infographics
for each row execute procedure public.set_infographics_updated_at();

commit;
