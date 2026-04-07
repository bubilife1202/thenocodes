-- Hackathons table for aggregated external hackathon listings
create table public.hackathons (
  id uuid default uuid_generate_v4() primary key,
  source text not null,           -- 'devpost', 'kaggle', 'dacon', 'festa', 'lablab', 'hackerearth'
  external_id text not null,      -- unique ID from the source
  title text not null,
  description text,
  organizer text,
  url text not null,              -- link to original hackathon page
  thumbnail_url text,
  prize text,                     -- prize description (e.g. "$10,000", "상금 500만원")
  tags text[] default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,                  -- 'online', 'Seoul', etc.
  collected_at timestamptz default now() not null,
  unique(source, external_id)
);

alter table public.hackathons enable row level security;

create policy "Hackathons are viewable by everyone"
  on public.hackathons for select using (true);

create policy "Service role can manage hackathons"
  on public.hackathons for all using (true);

-- Indexes
create index idx_hackathons_dates on public.hackathons(starts_at, ends_at);
create index idx_hackathons_source on public.hackathons(source);
