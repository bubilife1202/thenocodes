alter table public.community_posts
  add column source text not null default 'web'
  check (source in ('web', 'api'));
