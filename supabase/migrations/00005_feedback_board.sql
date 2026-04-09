-- Feedback board for community suggestions / bugs / roadmap

create type public.feedback_kind as enum ('feature', 'bug', 'ui', 'content', 'data', 'other');
create type public.feedback_status as enum ('inbox', 'queued', 'in_progress', 'review', 'done', 'archived');
create type public.feedback_priority as enum ('low', 'medium', 'high');
create type public.feedback_source as enum ('community', 'operator', 'internal');

create table public.feedback_items (
  id uuid default uuid_generate_v4() primary key,
  slug text unique,
  title text not null,
  body text not null,
  kind public.feedback_kind default 'feature' not null,
  status public.feedback_status default 'inbox' not null,
  priority public.feedback_priority default 'medium' not null,
  source public.feedback_source default 'community' not null,
  submitter_name text,
  submitter_contact text,
  related_url text,
  screenshot_url text,
  tags text[] default '{}' not null,
  vote_count integer default 0 not null,
  is_public boolean default true not null,
  admin_notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.feedback_votes (
  id uuid default uuid_generate_v4() primary key,
  feedback_id uuid references public.feedback_items(id) on delete cascade not null,
  voter_key text not null,
  created_at timestamptz default now() not null,
  unique(feedback_id, voter_key)
);

create table public.feedback_status_logs (
  id uuid default uuid_generate_v4() primary key,
  feedback_id uuid references public.feedback_items(id) on delete cascade not null,
  from_status public.feedback_status,
  to_status public.feedback_status not null,
  note text,
  created_at timestamptz default now() not null
);

alter table public.feedback_items enable row level security;
alter table public.feedback_votes enable row level security;
alter table public.feedback_status_logs enable row level security;

create policy "Public feedback is viewable by everyone"
  on public.feedback_items for select using (is_public = true);

create policy "Anyone can submit feedback"
  on public.feedback_items for insert with check (true);

create policy "Service role can manage feedback items"
  on public.feedback_items for all using (true);

create policy "Votes are viewable by everyone"
  on public.feedback_votes for select using (true);

create policy "Anyone can vote once per voter key"
  on public.feedback_votes for insert with check (true);

create policy "Service role can manage feedback votes"
  on public.feedback_votes for all using (true);

create policy "Feedback status logs are viewable by everyone"
  on public.feedback_status_logs for select using (true);

create policy "Service role can manage feedback logs"
  on public.feedback_status_logs for all using (true);

create index idx_feedback_items_status on public.feedback_items(status, created_at desc);
create index idx_feedback_items_kind on public.feedback_items(kind, created_at desc);
create index idx_feedback_items_priority on public.feedback_items(priority, created_at desc);
create index idx_feedback_votes_feedback on public.feedback_votes(feedback_id);

create or replace function public.set_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_feedback_updated_at
before update on public.feedback_items
for each row execute procedure public.set_feedback_updated_at();

create or replace function public.update_feedback_vote_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'INSERT' then
    update public.feedback_items set vote_count = vote_count + 1 where id = NEW.feedback_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.feedback_items set vote_count = greatest(vote_count - 1, 0) where id = OLD.feedback_id;
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_feedback_vote_count
after insert or delete on public.feedback_votes
for each row execute procedure public.update_feedback_vote_count();
