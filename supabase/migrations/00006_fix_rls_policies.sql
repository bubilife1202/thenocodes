-- Fix overly permissive RLS policies that grant anonymous users full write access.
-- service_role bypasses RLS entirely, so "for all using (true)" policies are unnecessary
-- and dangerous — they allow anon users to INSERT/UPDATE/DELETE.

-- 1. hackathons: remove "for all" policy, keep read-only
drop policy if exists "Service role can manage hackathons" on public.hackathons;

-- 2. feedback_items: remove "for all", keep select + insert
drop policy if exists "Service role can manage feedback items" on public.feedback_items;

-- 3. feedback_votes: remove "for all", keep select + insert
drop policy if exists "Service role can manage feedback votes" on public.feedback_votes;

-- 4. feedback_status_logs: add read-only policy (was missing)
create policy "Status logs are viewable by everyone"
  on public.feedback_status_logs for select using (true);
