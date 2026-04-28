import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats, type HackathonRow } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals, type SignalRow } from "@/lib/data/signals";
import { getFeaturedInfographics, type InfographicRow } from "@/lib/data/infographics";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { buildTodayActivity, formatKstActivityTime, getLatestActivityAt, type TodayActivityItem } from "@/lib/home/today-board";
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

const ACTIVITY_TONE_CLASS: Record<NonNullable<TodayActivityItem["tone"]>, string> = {
  teal: "border-[#D9EFEA] bg-white text-[#0F766E]",
  orange: "border-[#F2D7BC] bg-white text-[#C46A1A]",
  purple: "border-[#E7D9F8] bg-white text-[#6D3FB8]",
  neutral: "border-[#ECE7DF] bg-white text-[#6B6760]",
};

function deadlineLabel(item: HackathonRow, now: Date) {
  if (!item.ends_at) return "상시";
  const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
  if (daysLeft <= 0) return "오늘";
  if (daysLeft <= 7) return `D-${daysLeft}`;
  return formatShortDate(item.ends_at);
}

function opportunityLabel(item: HackathonRow) {
  if (item.category === "contest") return "공모전";
  if (item.tags?.some((tag) => tag.includes("세미나"))) return "세미나";
  if (item.category === "meetup") return "밋업";
  return "해커톤";
}

function OpportunityRow({ item, now }: { item: HackathonRow; now: Date }) {
  const isContest = item.category === "contest";
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`whitespace-nowrap text-[11px] font-black ${isContest ? "text-[#C46A1A]" : "text-[#0F766E]"}`}>
          {opportunityLabel(item)}
        </span>
        <span className="ml-auto whitespace-nowrap rounded-full bg-[#F8F5F0] px-2.5 py-1 text-[11px] font-black text-[#6B6760]">
          {deadlineLabel(item, now)}
        </span>
      </div>
      <p className="mt-1 break-keep text-sm font-bold leading-5 text-[#18181B]">{item.title}</p>
      <p className="mt-1 break-keep text-xs leading-5 text-[#8A8278]">{item.organizer || item.source}</p>
    </a>
  );
}

function MeetupRow({ item }: { item: HackathonRow }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap text-[11px] font-black text-[#0F766E]">{opportunityLabel(item)}</span>
        <span className="ml-auto whitespace-nowrap rounded-full bg-[#F3FBF9] px-2.5 py-1 text-[11px] font-black text-[#5C7D78]">
          {item.starts_at ? formatShortDate(item.starts_at) : "일정 미정"}
        </span>
      </div>
      <p className="mt-1 break-keep text-sm font-bold leading-5 text-[#18181B]">{item.title}</p>
      <p className="mt-1 break-keep text-xs leading-5 text-[#8A8278]">{item.organizer || item.location || item.source}</p>
    </a>
  );
}

function SignalRowLink({ item }: { item: SignalRow }) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap text-[11px] font-black text-[#0F766E]">{SIGNAL_TYPE_KO[item.signal_type]}</span>
        <span className="ml-auto whitespace-nowrap rounded-full bg-[#F3FBF9] px-2.5 py-1 text-[11px] font-black text-[#5C7D78]">
          {formatShortDate(item.published_at)}
        </span>
      </div>
      <p className="mt-1 break-keep text-sm font-bold leading-5 text-[#18181B]">{item.title}</p>
      <p className="mt-1 break-keep text-xs leading-5 text-[#8A8278]">{item.source_name || "source"}</p>
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
      className="block rounded-2xl border border-[#F1EAE0] bg-white px-4 py-3 transition-colors hover:border-[#D9EFEA] hover:bg-[#FBFEFD]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="whitespace-nowrap text-[11px] font-black text-[#6D3FB8]">{label}</span>
        <span className="ml-auto whitespace-nowrap rounded-full bg-[#FCF9FF] px-2.5 py-1 text-[11px] font-black text-[#6D3FB8]">
          {item.published_at ? formatShortDate(item.published_at) : formatShortDate(item.created_at)}
        </span>
      </div>
      <p className="mt-1 break-keep text-sm font-bold leading-5 text-[#18181B]">{item.title}</p>
      <p className="mt-1 break-keep text-xs leading-5 text-[#8A8278]">{meta}</p>
    </a>
  );
}

function ActivityRow({ item }: { item: TodayActivityItem }) {
  const toneClass = ACTIVITY_TONE_CLASS[item.tone || "neutral"];

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-[#D9EFEA] bg-white px-4 py-3 transition-colors hover:border-[#0F766E]/30 hover:bg-[#FBFEFD]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-black ${toneClass}`}>{item.source}</span>
        <span className="ml-auto whitespace-nowrap text-[11px] font-bold text-[#8A8278]">{formatKstActivityTime(item.timestamp).replace(" KST", "")}</span>
      </div>
      <p className="mt-2 break-keep text-sm font-bold leading-5 text-[#18181B]">{item.title}</p>
      {item.meta ? <p className="mt-1 break-keep text-xs leading-5 text-[#8A8278]">{item.meta}</p> : null}
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

  const activityItems: TodayActivityItem[] = [
    ...opportunities.map((item) => ({
      id: `opportunity-${item.id}`,
      title: item.title,
      href: item.url,
      source: opportunityLabel(item),
      timestamp: item.collected_at,
      meta: item.organizer || item.source,
      tone: item.category === "contest" ? "orange" as const : "teal" as const,
    })),
    ...meetups.map((item) => ({
      id: `meetup-${item.id}`,
      title: item.title,
      href: item.url,
      source: opportunityLabel(item),
      timestamp: item.collected_at,
      meta: item.organizer || item.location || item.source,
      tone: "teal" as const,
    })),
    ...signals.map((item) => ({
      id: `signal-${item.id}`,
      title: item.title,
      href: item.source_url,
      source: SIGNAL_TYPE_KO[item.signal_type],
      timestamp: item.updated_at || item.published_at,
      meta: item.source_name || "builder signal",
      tone: "neutral" as const,
    })),
    ...infographics.map((item) => ({
      id: `infographic-${item.id}`,
      title: item.title,
      href: item.original_url,
      source: item.source_type === "github" ? "GitHub" : "논문",
      timestamp: item.updated_at || item.created_at,
      meta: item.repository || item.authors || "infographic",
      tone: "purple" as const,
    })),
  ];
  const todayActivity = buildTodayActivity(activityItems, now, 5);
  const latestActivityAt = getLatestActivityAt(activityItems);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#ECE7DF] bg-[linear-gradient(135deg,#FFFFFF_0%,#F8FFFD_52%,#FFF8EF_100%)] p-5 shadow-[0_24px_60px_-42px_rgba(24,24,27,0.32)] sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black tracking-[0.18em] text-[#0F766E]">오늘의 AI 빌더 보드</p>
              <span className="rounded-full border border-[#D9EFEA] bg-white/80 px-3 py-1 text-[11px] font-bold text-[#5C7D78]">
                마지막 반영 {latestActivityAt ? formatKstActivityTime(latestActivityAt) : "수집 대기"}
              </span>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-[#18181B] sm:text-5xl">
              오늘 볼 AI 기회와 빌더 흐름만 압축했습니다.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B6760]">
              해커톤·공모전 마감, 밋업·세미나 일정, OpenClaw/Hermes 업데이트, 논문·GitHub 요약을 매일 정리합니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/hackathons" className="rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#0B5F58]">
                마감 임박 보기
              </Link>
              <Link href="/openclaw" className="rounded-2xl border border-[#E6DED4] bg-white px-5 py-3 text-sm font-bold text-[#18181B] transition-colors hover:bg-[#F8F5F0]">
                에이전트 업데이트
              </Link>
              <Link href="/infographics" className="rounded-2xl border border-[#E7D9F8] bg-white px-5 py-3 text-sm font-bold text-[#6D3FB8] transition-colors hover:bg-[#FCF9FF]">
                인포그래픽 보기
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#D9EFEA] bg-white/85 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#5C7D78]">live board</p>
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
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">오늘 반영</p>
              <h2 className="mt-2 text-xl font-black text-[#123B38]">새로 들어온 기회·흐름</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5C7D78]">
                실제 수집·등록된 항목만 보여줍니다. 오늘 새 항목이 없으면 아래 보드에서 최근 반영 항목을 이어서 확인하세요.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#0F766E]">KST 기준</span>
          </div>
          <div className="mt-5 space-y-2">
            {todayActivity.length > 0 ? todayActivity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            )) : (
              <div className="rounded-2xl border border-[#D9EFEA] bg-white px-4 py-6">
                <p className="text-sm font-bold text-[#18181B]">오늘 새로 반영된 항목은 아직 없습니다.</p>
                <p className="mt-1 text-sm leading-6 text-[#6B6760]">일일 수집기가 다음 실행에서 해커톤·공모전·밋업·세미나 항목을 갱신합니다.</p>
              </div>
            )}
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
          <div className="grid gap-2 md:grid-cols-2">
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
            <h2 className="text-sm font-black text-[#18181B]">밋업 · 세미나</h2>
            <Link href="/meetups" className="text-xs font-bold text-[#0F766E] hover:underline">전체 보기 →</Link>
          </div>
          {meetups.length > 0 ? <div className="space-y-2">{meetups.map((item) => <MeetupRow key={item.id} item={item} />)}</div> : <p className="py-10 text-center text-sm text-[#A1A1AA]">등록된 밋업·세미나가 없습니다.</p>}
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
