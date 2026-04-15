create type public.community_post_type as enum ('used_it', 'found_it', 'question');
create type public.community_post_status as enum ('queued', 'approved', 'rejected');

create table public.community_posts (
  id uuid default gen_random_uuid() primary key,
  post_type public.community_post_type not null,
  title text not null,
  body text not null,
  link_url text,
  author_name text,
  vote_count integer default 0 not null,
  status public.community_post_status default 'approved' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_community_approved on public.community_posts (created_at desc) where status = 'approved';
create index idx_community_type on public.community_posts (post_type, created_at desc) where status = 'approved';
create index idx_community_votes on public.community_posts (vote_count desc, created_at desc) where status = 'approved';

alter table public.community_posts enable row level security;

create policy "공개 글 읽기" on public.community_posts
  for select using (status = 'approved');

create or replace function public.set_community_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_community_updated_at
  before update on public.community_posts
  for each row execute function public.set_community_updated_at();

create table public.community_votes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz default now() not null,
  unique(post_id, voter_hash)
);

create index idx_community_votes_post on public.community_votes(post_id);

alter table public.community_votes enable row level security;

create or replace function public.update_community_vote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts
    set vote_count = vote_count + 1
    where id = NEW.post_id and status = 'approved';
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.community_posts
    set vote_count = greatest(vote_count - 1, 0)
    where id = OLD.post_id and status = 'approved';
    return OLD;
  end if;

  return null;
end;
$$;

create trigger trg_community_vote_count
  after insert or delete on public.community_votes
  for each row execute function public.update_community_vote_count();
