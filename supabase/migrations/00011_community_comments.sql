create table public.community_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  body text not null,
  author_name text,
  source text not null default 'web' check (source in ('web', 'api')),
  created_at timestamptz default now() not null
);

create index idx_community_comments_post on public.community_comments (post_id, created_at asc);

alter table public.community_comments enable row level security;

create policy "댓글 읽기" on public.community_comments for select using (true);
create policy "누구나 댓글" on public.community_comments for insert with check (true);

-- 댓글 수 캐시 컬럼
alter table public.community_posts add column if not exists comment_count integer not null default 0;

create or replace function public.update_community_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.community_posts set comment_count = comment_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.community_posts set comment_count = greatest(comment_count - 1, 0) where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_community_comment_count
  after insert or delete on public.community_comments
  for each row execute function public.update_community_comment_count();
