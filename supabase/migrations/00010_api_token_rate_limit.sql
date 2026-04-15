create or replace function public.claim_api_token_quota(
  p_token_hash text,
  p_now timestamptz default now()
)
returns table (
  id uuid,
  name text,
  email text,
  revoked_at timestamptz,
  post_count integer,
  last_used_at timestamptz,
  created_at timestamptz,
  quota_claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  token_row public.api_tokens%rowtype;
  active_window boolean;
begin
  select *
    into token_row
  from public.api_tokens
  where token_hash = p_token_hash
  for update;

  if not found then
    return;
  end if;

  active_window := token_row.last_used_at is not null and token_row.last_used_at > p_now - interval '24 hours';

  if token_row.revoked_at is not null or (active_window and coalesce(token_row.post_count, 0) >= 50) then
    id := token_row.id;
    name := token_row.name;
    email := token_row.email;
    revoked_at := token_row.revoked_at;
    post_count := token_row.post_count;
    last_used_at := token_row.last_used_at;
    created_at := token_row.created_at;
    quota_claimed := false;
    return next;
    return;
  end if;

  update public.api_tokens
  set
    last_used_at = p_now,
    post_count = case
      when active_window then coalesce(token_row.post_count, 0) + 1
      else 1
    end
  where public.api_tokens.id = token_row.id
  returning
    public.api_tokens.id,
    public.api_tokens.name,
    public.api_tokens.email,
    public.api_tokens.revoked_at,
    public.api_tokens.post_count,
    public.api_tokens.last_used_at,
    public.api_tokens.created_at
  into id, name, email, revoked_at, post_count, last_used_at, created_at;

  quota_claimed := true;
  return next;
end;
$$;

create or replace function public.revert_api_token_quota(
  p_token_id uuid,
  p_now timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  token_row public.api_tokens%rowtype;
  next_count integer;
begin
  select *
    into token_row
  from public.api_tokens
  where id = p_token_id
  for update;

  if not found then
    return;
  end if;

  if token_row.last_used_at is null or token_row.last_used_at <= p_now - interval '24 hours' then
    return;
  end if;

  next_count := greatest(coalesce(token_row.post_count, 0) - 1, 0);

  update public.api_tokens
  set
    post_count = next_count,
    last_used_at = case when next_count = 0 then null else token_row.last_used_at end
  where public.api_tokens.id = token_row.id;
end;
$$;

revoke all on function public.claim_api_token_quota(text, timestamptz) from public;
revoke all on function public.claim_api_token_quota(text, timestamptz) from anon;
revoke all on function public.claim_api_token_quota(text, timestamptz) from authenticated;
grant execute on function public.claim_api_token_quota(text, timestamptz) to service_role;
revoke all on function public.revert_api_token_quota(uuid, timestamptz) from public;
revoke all on function public.revert_api_token_quota(uuid, timestamptz) from anon;
revoke all on function public.revert_api_token_quota(uuid, timestamptz) from authenticated;
grant execute on function public.revert_api_token_quota(uuid, timestamptz) to service_role;
