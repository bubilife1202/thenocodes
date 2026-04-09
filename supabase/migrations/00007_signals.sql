begin;

create table public.builder_signals (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  summary text not null,
  action_point text not null,
  source_url text not null,
  source_name text,
  signal_type text not null check (signal_type in ('platform_launch', 'api_tool', 'open_model', 'policy')),
  tags text[] default '{}' not null,
  published_at timestamptz default now() not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.builder_signals enable row level security;

create policy "Builder signals are viewable by everyone"
  on public.builder_signals for select using (true);

revoke insert, update, delete on table public.builder_signals from anon, authenticated;

create index idx_builder_signals_published_at
  on public.builder_signals(published_at desc);

create index idx_builder_signals_type_published_at
  on public.builder_signals(signal_type, published_at desc);

create index idx_builder_signals_featured_published_at
  on public.builder_signals(is_featured, published_at desc);

create or replace function public.set_builder_signals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_builder_signals_updated_at
before update on public.builder_signals
for each row execute procedure public.set_builder_signals_updated_at();

insert into public.builder_signals (
  slug,
  title,
  summary,
  action_point,
  source_url,
  source_name,
  signal_type,
  tags,
  published_at,
  is_featured
)
values
  (
    'claude-managed-agents',
    'Claude Managed Agents 런칭',
    'Anthropic이 클라우드 호스팅 에이전트 빌드/배포 API를 공개 베타로 출시. 샌드박싱, 인증, 상태 관리를 자동 처리하고 장시간 자율 운영 세션을 지원한다.',
    'API 키만 있으면 첫 에이전트 10분 내 배포 가능. YAML이나 자연어로 에이전트 정의. 공식 문서 확인.',
    'https://claude.com/blog/claude-managed-agents',
    'Anthropic',
    'platform_launch',
    '{"AI","Agent","API","Anthropic"}',
    '2026-04-08T00:00:00+09:00',
    true
  ),
  (
    'lg-exaone-4-5-open-source',
    'LG 엑사원 4.5 오픈소스 공개',
    'LG AI연구원이 330억 파라미터 멀티모달 모델 엑사원 4.5를 오픈소스로 공개. 한국어·영어 등 6개 언어 지원, STEM 벤치마크에서 GPT-5 mini와 Claude Sonnet 4.5를 능가.',
    'HuggingFace에서 바로 다운로드 가능. 한국어 특화 모델이 필요한 프로젝트에 즉시 적용 가능.',
    'https://huggingface.co/LGAI-EXAONE',
    'LG AI Research',
    'open_model',
    '{"AI","오픈소스","LLM","한국어","HuggingFace"}',
    '2026-04-09T00:00:00+09:00',
    true
  );

commit;
