import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats, type HackathonRow } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals, type SignalRow } from "@/lib/data/signals";
import { getFeaturedInfographics, type InfographicRow } from "@/lib/data/infographics";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";
import type { SignalType } from "@/lib/signals/constants";

export const revalidate = 300;

const SIGNAL_TYPE_KO: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API",
  open_model: "오픈모델",
  policy: "정책",
  research: "연구",
};

function deadlineLabel(item: HackathonRow, now: Date) {
  if (!item.ends_at) return "상시";
  const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
  if (daysLeft <= 0) return "오늘";
  if (daysLeft <= 7) return `D-${daysLeft}`;
  return formatShortDate(item.ends_at);
}

function OpportunityRow({ item, now }: { item: HackathonRow; now: Date }) {
  const isContest = item.category === "contest";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="grid gap-2 rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD] sm:grid-cols-[72px_minmax(0,1fr)_96px_112px] sm:items-center"
    >
      <span className={`whitespace-nowrap text-[11px] font-black ${isContest ? "text-[#C46A1A]" : "text-[#0F766E]"}`}>
        {isContest ? "공모전" : "해커톤"}
      </span>
      <span className="min-w-0 text-sm font-bold text-[#18181B] sm:truncate">{item.title}</span>
      <span className="whitespace-nowrap text-xs font-semibold text-[#6B6760] sm:text-right">{deadlineLabel(item, now)}</span>
      <span className="min-w-0 text-xs text-[#A1A1AA] sm:truncate sm:text-right">{item.organizer || item.source}</span>
    </a>
  );
}

function MeetupRow({ item }: { item: HackathonRow }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="grid gap-2 rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD] sm:grid-cols-[72px_minmax(0,1fr)_96px_112px] sm:items-center"
    >
      <span className="whitespace-nowrap text-[11px] font-black text-[#0F766E]">밋업</span>
      <span className="min-w-0 text-sm font-bold text-[#18181B] sm:truncate">{item.title}</span>
      <span className="whitespace-nowrap text-xs font-semibold text-[#6B6760] sm:text-right">{item.starts_at ? formatShortDate(item.starts_at) : "일정 미정"}</span>
      <span className="min-w-0 text-xs text-[#A1A1AA] sm:truncate sm:text-right">{item.organizer || item.location || item.source}</span>
    </a>
  );
}

function SignalRowLink({ item }: { item: SignalRow }) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="grid gap-2 rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD] sm:grid-cols-[72px_minmax(0,1fr)_96px_112px] sm:items-center"
    >
      <span className="whitespace-nowrap text-[11px] font-black text-[#0F766E]">{SIGNAL_TYPE_KO[item.signal_type]}</span>
      <span className="min-w-0 text-sm font-bold text-[#18181B] sm:truncate">{item.title}</span>
      <span className="whitespace-nowrap text-xs font-semibold text-[#6B6760] sm:text-right">{formatShortDate(item.published_at)}</span>
      <span className="min-w-0 text-xs text-[#A1A1AA] sm:truncate sm:text-right">{item.source_name || "source"}</span>
    </a>
  );
}

function InfographicRowLink({ item }: { item: InfographicRow }) {
  const label = item.source_type === "github" ? "GitHub" : "논문";
  const meta = item.source_type === "github" ? item.repository || "repo" : item.authors || "paper";

  return (
    <a
      href={item.original_url}
      target="_blank"
      rel="noopener noreferrer"
      className="grid gap-2 rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD] sm:grid-cols-[72px_minmax(0,1fr)_96px_112px] sm:items-center"
    >
      <span className="whitespace-nowrap text-[11px] font-black text-[#6D3FB8]">{label}</span>
      <span className="min-w-0 text-sm font-bold text-[#18181B] sm:truncate">{item.title}</span>
      <span className="whitespace-nowrap text-xs font-semibold text-[#6B6760] sm:text-right">
        {item.published_at ? formatShortDate(item.published_at) : formatShortDate(item.created_at)}
      </span>
      <span className="min-w-0 text-xs text-[#A1A1AA] sm:truncate sm:text-right">{meta}</span>
    </a>
  );
}

async function HomeContent() {
  const [{ hackathons, contests }, meetups, signals, infographics, stats] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(4),
    getFeaturedSignals(4),
    getFeaturedInfographics(3),
    getStats(),
  ]);

  const sorted = sortHackathons([...hackathons, ...contests]);
  const opportunities = sorted.slice(0, 8);

  const now = new Date();
  const deadlineSoon = sorted.filter((item) => {
    if (!item.ends_at || getHackathonStatus(item, now) !== "active") return false;
    const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#ECE7DF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FFFD_52%,#FFF8EF_100%)] p-5 shadow-[0_24px_60px_-42px_rgba(24,24,27,0.32)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0F766E]">AI builder dashboard</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#18181B] sm:text-5xl">
              실전 시나리오로 훈련하고, 오늘 열린 기회로 바로 실행하세요.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B6760]">
              더노코즈는 AI 협업·검증·개선 역량을 보여주는 훈련 경로와 해커톤, 공모전, 밋업, 빌더 흐름을 한 화면에서 비교하는 운영 보드입니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/scenarios" className="rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#0B5F58]">
                실전 시나리오 시작하기
              </Link>
              <Link href="/hackathons" className="rounded-2xl border border-[#E6DED4] bg-white px-5 py-3 text-sm font-bold text-[#18181B] transition-colors hover:bg-[#F8F5F0]">
                기회 보드 보기
              </Link>
              <Link href="/infographics" className="rounded-2xl border border-[#E7D9F8] bg-white px-5 py-3 text-sm font-bold text-[#6D3FB8] transition-colors hover:bg-[#FCF9FF]">
                인포그래픽 보기
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#D9EFEA] bg-white/85 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#5C7D78]">live inventory</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-[#F3FBF9] p-3">
                <p className="text-2xl font-black text-[#0F766E]">{stats.hackathons + stats.contests}</p>
                <p className="whitespace-nowrap text-[11px] font-bold text-[#5C7D78]">기회</p>
              </div>
              <div className="rounded-2xl bg-[#FFF6ED] p-3">
                <p className="text-2xl font-black text-[#C46A1A]">{deadlineSoon.length}</p>
                <p className="whitespace-nowrap text-[11px] font-bold text-[#8A6A4A]">마감 임박</p>
              </div>
              <div className="rounded-2xl bg-[#F8F5F0] p-3">
                <p className="text-2xl font-black text-[#18181B]">{stats.meetups}</p>
                <p className="whitespace-nowrap text-[11px] font-bold text-[#8A8278]">밋업</p>
              </div>
            </div>
            <Link href="/community" className="mt-4 flex items-center justify-between rounded-2xl border border-[#ECE7DF] px-4 py-3 text-sm font-bold text-[#18181B] hover:bg-[#F8F5F0]">
              커뮤니티 신호 모으기 <span className="text-[#0F766E]">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-[28px] border border-[#D9EFEA] bg-[#F6FCFB] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">featured path</p>
              <h2 className="mt-2 text-xl font-black text-[#123B38]">실전 시나리오 #1 · flaky timezone test</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5C7D78]">
                AI에게 맡기는 실력이 아니라, AI를 지휘하고 검증하며 결과를 개선하는 과정을 정적 증거로 남깁니다. 제출 후 사람 채점 워크스루로 Collaboration · Verification · Improvement를 확인합니다.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#0F766E]">L1-L4 rubric</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["시나리오 저장소", "정적 대화 증거", "사람 채점 워크스루"].map((label, i) => (
              <div key={label} className="rounded-2xl border border-[#D9EFEA] bg-white px-4 py-3">
                <p className="text-[11px] font-black text-[#0F766E]">0{i + 1}</p>
                <p className="mt-1 text-sm font-bold text-[#18181B]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/scenarios" className="rounded-xl bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-[#0B5F58]">실전 시나리오 보기</Link>
            <Link href="/scenarios/walkthrough" className="rounded-xl border border-[#D9EFEA] bg-white px-4 py-2 text-sm font-bold text-[#123B38] hover:bg-[#F3FBF9]">채점 예시 보기</Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#ECD9C7] bg-[#FFFBF7] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-sm font-black text-[#18181B]">마감 임박</h2>
            <Link href="/hackathons" className="ml-auto text-xs font-bold text-[#A1A1AA] hover:text-[#18181B]">전체 보기 →</Link>
          </div>
          <div className="space-y-2">
            {deadlineSoon.length > 0 ? deadlineSoon.slice(0, 4).map((item) => (
              <OpportunityRow key={item.id} item={item} now={now} />
            )) : (
              <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-[#A1A1AA]">이번 주 마감 임박 항목이 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-black text-[#18181B]">기회 보드</h2>
          <Link href="/hackathons" className="whitespace-nowrap text-xs font-bold text-[#0F766E] hover:underline">전체 보기 →</Link>
        </div>
        {opportunities.length > 0 ? (
          <div className="space-y-2">
            {opportunities.map((item) => <OpportunityRow key={item.id} item={item} now={now} />)}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[#A1A1AA]">등록된 항목이 없습니다. 매일 업데이트됩니다.</p>
        )}
      </section>

      <section className="rounded-[28px] border border-[#E7D9F8] bg-[#FCF9FF] p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-black text-[#18181B]">인포그래픽</h2>
          <Link href="/infographics" className="text-xs font-bold text-[#6D3FB8] hover:underline">전체 보기 →</Link>
          <p className="w-full text-xs leading-5 text-[#7B7188] sm:w-auto">논문과 GitHub 프로젝트를 한 장 요약으로 읽습니다.</p>
        </div>
        {infographics.length > 0 ? (
          <div className="space-y-2">
            {infographics.map((item) => <InfographicRowLink key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-6">
            <p className="text-sm font-bold text-[#18181B]">첫 인포그래픽을 준비 중입니다.</p>
            <p className="mt-1 text-sm leading-6 text-[#6B6760]">논문과 GitHub 프로젝트의 핵심 한 줄, 구조, 실험/기능, 결과, 한계, 다음 액션을 한 장으로 정리해 쌓습니다.</p>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-black text-[#18181B]">서울 밋업</h2>
            <Link href="/meetups" className="text-xs font-bold text-[#0F766E] hover:underline">전체 보기 →</Link>
          </div>
          {meetups.length > 0 ? <div className="space-y-2">{meetups.map((item) => <MeetupRow key={item.id} item={item} />)}</div> : <p className="py-10 text-center text-sm text-[#A1A1AA]">등록된 밋업이 없습니다.</p>}
        </section>

        <section className="rounded-[28px] border border-[#ECE7DF] bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-black text-[#18181B]">흐름</h2>
            <Link href="/signals" className="text-xs font-bold text-[#0F766E] hover:underline">전체 보기 →</Link>
          </div>
          {signals.length > 0 ? <div className="space-y-2">{signals.map((item) => <SignalRowLink key={item.id} item={item} />)}</div> : <p className="py-10 text-center text-sm text-[#A1A1AA]">등록된 흐름이 없습니다.</p>}
        </section>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<div className="space-y-3">{[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="h-16 animate-pulse rounded-3xl bg-gray-100" />)}</div>}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
