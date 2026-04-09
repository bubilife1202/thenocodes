-- 슬랙에서 올라온 링크 대기열
create table public.pending_signals (
  id uuid default uuid_generate_v4() primary key,
  url text not null,
  submitted_by text,              -- 슬랙 유저 이름
  slack_channel text,
  slack_ts text,                  -- 슬랙 메시지 타임스탬프 (답글용)
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  created_at timestamptz default now() not null
);

alter table public.pending_signals enable row level security;

create policy "Pending signals are viewable by everyone"
  on public.pending_signals for select using (true);

-- anon은 insert만 (슬랙 봇이 넣음), update/delete는 service_role만
create policy "Anyone can submit pending signals"
  on public.pending_signals for insert with check (true);

revoke update, delete on table public.pending_signals from anon, authenticated;

create index idx_pending_signals_status on public.pending_signals(status, created_at desc);
