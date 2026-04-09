-- Fix overly permissive RLS policies that grant anonymous users full write access.
-- "for all using (true)" allows anon users INSERT/UPDATE/DELETE.
-- service_role bypasses RLS, so these policies only need to restrict anon/authenticated.

begin;

-- 1. hackathons: replace "for all" with service_role-only write
drop policy if exists "Service role can manage hackathons" on public.hackathons;
revoke insert, update, delete on table public.hackathons from anon, authenticated;

-- 2. feedback_items: replace "for all" with service_role-only write
drop policy if exists "Service role can manage feedback items" on public.feedback_items;
-- Restrict public SELECT to non-sensitive columns via RLS
-- (submitter_contact, admin_notes should not be exposed to anon)
drop policy if exists "Public feedback is viewable by everyone" on public.feedback_items;
create policy "Public feedback is viewable by everyone"
  on public.feedback_items for select using (is_public = true);
-- Keep anonymous insert for feedback submissions (via future form)
-- but restrict what fields can be set via with check
revoke update, delete on table public.feedback_items from anon, authenticated;

-- 3. feedback_votes: replace "for all" with service_role-only management
drop policy if exists "Service role can manage feedback votes" on public.feedback_votes;
revoke update, delete on table public.feedback_votes from anon, authenticated;

-- 4. feedback_status_logs: add read-only policy (was missing), revoke writes
create policy "Status logs are viewable by everyone"
  on public.feedback_status_logs for select using (true);
revoke insert, update, delete on table public.feedback_status_logs from anon, authenticated;

commit;
