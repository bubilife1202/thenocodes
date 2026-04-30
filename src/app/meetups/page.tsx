import { Suspense } from "react";
import Link from "next/link";
import { getMeetups } from "@/lib/data/meetups";
import type { HackathonRow } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const KR_TIME = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

const SEMINAR_TERMS = ["세미나", "웨비나", "컨퍼런스", "포럼", "강연", "워크숍", "교육", "seminar", "webinar", "conference", "workshop"];

function isSeminarLike(item: HackathonRow) {
  const haystack = [item.title, item.description, item.organizer, ...(item.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return SEMINAR_TERMS.some((term) => haystack.includes(term.toLowerCase()));
}

function formatSchedule(startsAt: string | null, endsAt: string | null) {
  if (startsAt && endsAt) {
    const sameDay =
      new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(startsAt)) ===
      new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(endsAt));
    return {
      date: sameDay ? formatShortDate(startsAt) : `${formatShortDate(startsAt)} - ${formatShortDate(endsAt)}`,
      time: `${KR_TIME.format(new Date(startsAt))} - ${KR_TIME.format(new Date(endsAt))}`,
    };
  }
  if (startsAt) return { date: formatShortDate(startsAt), time: KR_TIME.format(new Date(startsAt)) };
  if (endsAt) return { date: formatShortDate(endsAt), time: KR_TIME.format(new Date(endsAt)) };
  return { date: "미정", time: "시간 미정" };
}

function KindBadge({ item }: { item: HackathonRow }) {
  const seminar = isSeminarLike(item);
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-black ${seminar ? "bg-[#FFF7ED] text-[#C46A1A]" : "bg-[#F3FBF9] text-[#0F766E]"}`}>
      {seminar ? "세미나" : "밋업"}
    </span>
  );
}

function StatusBadge({ status }: { status: HackathonStatus }) {
  if (status === "active") return <span className="whitespace-nowrap text-xs font-black text-[#0F766E]">진행중</span>;
  if (status === "upcoming") return <span className="whitespace-nowrap text-xs font-black text-[#315E9B]">예정</span>;
  return <span className="whitespace-nowrap text-xs font-black text-[#A1A1AA]">종료</span>;
}

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: number; tone?: "teal" | "orange" | "blue" | "neutral" }) {
  const toneClass = {
    teal: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]",
    orange: "border-[#F2D7BC] bg-[#FFF7ED] text-[#C46A1A]",
    blue: "border-[#DCEAFE] bg-[#F4F8FE] text-[#315E9B]",
    neutral: "border-[#ECE7DF] bg-[#F8F5F0] text-[#18181B]",
  }[tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 whitespace-nowrap text-[11px] font-bold opacity-80">{label}</p>
    </div>
  );
}

function MeetupRows({ meetups, now }: { meetups: HackathonRow[]; now: Date }) {
  if (meetups.length === 0) return <p className="py-12 text-center text-sm text-[#A1A1AA]">밋업이 없습니다</p>;

  return (
    <div className="divide-y divide-[#F3F0EB]">
      {meetups.map((m) => {
        const status = getHackathonStatus(m, now);
        const schedule = formatSchedule(m.starts_at, m.ends_at);
        return (
          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="grid gap-2 px-1 py-3 hover:bg-[#FCFBF8] sm:grid-cols-[112px_74px_minmax(0,1fr)_140px_120px_74px] sm:items-start">
            <span className="text-xs font-bold text-[#0F766E]">{schedule.date}<br /><span className="font-medium text-[#8A8278]">{schedule.time}</span></span>
            <span><KindBadge item={m} /></span>
            <span className="min-w-0"><strong className="block text-sm text-[#18181B]">{m.title}</strong>{m.description && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#8A8278]">{m.description}</span>}</span>
            <span className="truncate text-xs text-[#6B6760]">{m.organizer || "주최 미정"}</span>
            <span className="truncate text-xs text-[#A1A1AA]">{m.location || "온라인"}</span>
            <StatusBadge status={status} />
          </a>
        );
      })}
    </div>
  );
}

async function MeetupBoard({ filter }: { filter?: HackathonStatus }) {
  const [allMeetups, visibleMeetups] = filter
    ? await Promise.all([getMeetups(), getMeetups(filter)])
    : await getMeetups().then((rows) => [rows, rows] as const);
  const now = new Date();
  const active = allMeetups.filter((item) => getHackathonStatus(item, now) === "active");
  const upcoming = allMeetups.filter((item) => getHackathonStatus(item, now) === "upcoming");
  const seminars = allMeetups.filter(isSeminarLike);
  const nextMeetups = allMeetups
    .filter((item) => getHackathonStatus(item, now) === "upcoming")
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryCard label="전체 일정" value={allMeetups.length} tone="neutral" />
        <SummaryCard label="진행중" value={active.length} tone="teal" />
        <SummaryCard label="예정" value={upcoming.length} tone="blue" />
        <SummaryCard label="세미나/교육" value={seminars.length} tone="orange" />
      </div>

      {nextMeetups.length > 0 ? (
        <div className="rounded-2xl border border-[#D9EFEA] bg-[#F6FCFB] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">upcoming timeline</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {nextMeetups.map((item) => {
              const schedule = formatSchedule(item.starts_at, item.ends_at);
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white px-4 py-3 hover:bg-[#FBFEFD]">
                  <div className="flex items-center gap-2">
                    <KindBadge item={item} />
                    <span className="ml-auto text-[11px] font-black text-[#5C7D78]">{schedule.date}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-bold text-[#18181B]">{item.title}</p>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      <MeetupRows meetups={visibleMeetups} now={now} />
    </div>
  );
}

export default async function MeetupsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;
  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "진행중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">opportunity comparison</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">밋업 / 세미나</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B6760]">세미나는 별도 DB 카테고리가 아니라 밋업 안에서 제목·태그·설명 키워드로 구분해 표시합니다.</p>
          </div>
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.value ? `/meetups?status=${tab.value}` : "/meetups"}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  currentFilter === tab.value
                    ? "bg-[#18181B] text-white"
                    : "text-[#A1A1AA] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-5">
        <p className="mb-5 text-sm text-[#6B6760]">
          서울 기준으로 열리는 AI 밋업과 세미나를 중심으로, 장소 · 일정 · 시간 · 주최 · 소스를 바로 비교할 수 있게 정리했습니다.
        </p>
        <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
          <MeetupBoard filter={currentFilter} />
        </Suspense>
      </div>
    </div>
  );
}
