-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom types
create type user_role as enum ('user', 'admin');
create type challenge_category as enum ('ai_automation', 'data', 'nocode', 'prompt', 'project');
create type challenge_difficulty as enum ('beginner', 'intermediate', 'advanced');
create type challenge_status as enum ('draft', 'active', 'closed');
create type challenge_source as enum ('admin', 'community', 'company');
create type proposal_status as enum ('pending', 'approved', 'rejected');
create type point_reason as enum ('submission', 'vote_received', 'featured', 'proposal_accepted', 'blog');

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role user_role default 'user' not null,
  total_points integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- Challenges
create table public.challenges (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  category challenge_category not null,
  difficulty challenge_difficulty not null,
  tags text[] default '{}',
  status challenge_status default 'draft' not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.users(id) not null,
  source challenge_source default 'admin' not null,
  company_name text,
  created_at timestamptz default now() not null
);

alter table public.challenges enable row level security;

create policy "Active challenges are viewable by everyone"
  on public.challenges for select using (status = 'active' or status = 'closed');

create policy "Admins can manage all challenges"
  on public.challenges for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Submissions
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  link_url text,
  vote_count integer default 0 not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.submissions enable row level security;

create policy "Submissions are viewable by everyone"
  on public.submissions for select using (true);

create policy "Authenticated users can submit"
  on public.submissions for insert with check (auth.uid() = user_id);

create policy "Users can update own submissions"
  on public.submissions for update using (auth.uid() = user_id);

-- Votes
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(submission_id, user_id)
);

alter table public.votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = user_id);

create policy "Users can remove own votes"
  on public.votes for delete using (auth.uid() = user_id);

-- Challenge Proposals
create table public.challenge_proposals (
  id uuid default uuid_generate_v4() primary key,
  proposed_by uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  category challenge_category not null,
  difficulty_suggestion challenge_difficulty not null,
  real_world_context text,
  status proposal_status default 'pending' not null,
  reviewed_by uuid references public.users(id),
  created_at timestamptz default now() not null
);

alter table public.challenge_proposals enable row level security;

create policy "Users can view own proposals"
  on public.challenge_proposals for select using (auth.uid() = proposed_by);

create policy "Admins can view all proposals"
  on public.challenge_proposals for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can propose"
  on public.challenge_proposals for insert with check (auth.uid() = proposed_by);

create policy "Admins can update proposals"
  on public.challenge_proposals for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Blog Posts
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  content text not null,
  author_id uuid references public.users(id) not null,
  tags text[] default '{}',
  published_at timestamptz,
  is_published boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.blog_posts enable row level security;

create policy "Published posts are viewable by everyone"
  on public.blog_posts for select using (is_published = true);

create policy "Admins can manage all posts"
  on public.blog_posts for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Point Logs
create table public.point_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  points integer not null,
  reason point_reason not null,
  reference_id uuid,
  created_at timestamptz default now() not null
);

alter table public.point_logs enable row level security;

create policy "Users can view own point logs"
  on public.point_logs for select using (auth.uid() = user_id);

-- Indexes
create index idx_challenges_status on public.challenges(status);
create index idx_challenges_category on public.challenges(category);
create index idx_challenges_slug on public.challenges(slug);
create index idx_submissions_challenge on public.submissions(challenge_id);
create index idx_submissions_user on public.submissions(user_id);
create index idx_votes_submission on public.votes(submission_id);
create index idx_blog_posts_published on public.blog_posts(is_published, published_at desc);
create index idx_users_points on public.users(total_points desc);
create index idx_point_logs_user on public.point_logs(user_id);

-- Function: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update vote count on submissions
create or replace function public.update_vote_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.submissions set vote_count = vote_count + 1 where id = NEW.submission_id;
    -- Award point to submission author
    insert into public.point_logs (user_id, points, reason, reference_id)
    select user_id, 2, 'vote_received', NEW.submission_id
    from public.submissions where id = NEW.submission_id;
    -- Update total points
    update public.users set total_points = total_points + 2
    where id = (select user_id from public.submissions where id = NEW.submission_id);
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.submissions set vote_count = vote_count - 1 where id = OLD.submission_id;
    -- Deduct point from submission author
    update public.users set total_points = total_points - 2
    where id = (select user_id from public.submissions where id = OLD.submission_id);
    return OLD;
  end if;
end;
$$;

create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute procedure public.update_vote_count();
