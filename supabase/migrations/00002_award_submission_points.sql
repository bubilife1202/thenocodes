-- 1. Unique constraint: prevent duplicate submissions per user per challenge
alter table public.submissions
add constraint one_submission_per_user_per_challenge unique(challenge_id, user_id);

-- 2. RLS policy: prevent self-voting at DB level
create policy "Users cannot vote on own submissions"
  on public.votes as restrictive for insert
  with check (
    user_id != (select user_id from public.submissions where id = submission_id)
  );

-- 3. Atomic function to award submission points (SECURITY INVOKER + validation)
create or replace function public.award_submission_points(uid uuid, pts integer, ref_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  -- Validate: points must be positive
  if pts <= 0 then
    raise exception 'Points must be positive';
  end if;

  -- Validate: caller can only award points to themselves
  if uid != auth.uid() then
    raise exception 'Cannot award points to another user';
  end if;

  -- Validate: submission must exist for this user and challenge
  if not exists (
    select 1 from public.submissions
    where challenge_id = ref_id and user_id = uid
  ) then
    raise exception 'No matching submission found';
  end if;

  -- Prevent duplicate point awards for same submission
  if exists (
    select 1 from public.point_logs
    where user_id = uid and reason = 'submission' and reference_id = ref_id
  ) then
    return; -- Already awarded, silently skip
  end if;

  -- Insert point log
  insert into public.point_logs (user_id, points, reason, reference_id)
  values (uid, pts, 'submission', ref_id);

  -- Update total points atomically
  update public.users
  set total_points = total_points + pts
  where id = uid;
end;
$$;
