import { Suspense } from "react";
import Link from "next/link";
import { getMeetups } from "@/lib/data/meetups";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const KR_TIME = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

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

async function MeetupTable({ filter }: { filter?: HackathonStatus }) {
  const meetups = await getMeetups(filter);
  const now = new Date();
  if (meetups.length === 0) return <p className="py-12 text-center text-sm text-[#A1A1AA]">밋업이 없습니다</p>;

  return (
    <div className="divide-y divide-[#F3F0EB]">
      {meetups.map((m) => {
        const status = getHackathonStatus(m, now);
        const schedule = formatSchedule(m.starts_at, m.ends_at);
        return (
          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="grid gap-2 px-1 py-3 hover:bg-[#FCFBF8] sm:grid-cols-[112px_minmax(0,1fr)_140px_120px_74px] sm:items-start">
            <span className="text-xs font-bold text-[#0F766E]">{schedule.date}<br /><span className="font-medium text-[#8A8278]">{schedule.time}</span></span>
            <span className="min-w-0"><strong className="block text-sm text-[#18181B]">{m.title}</strong>{m.description && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#8A8278]">{m.description}</span>}</span>
            <span className="truncate text-xs text-[#6B6760]">{m.organizer || "주최 미정"}</span>
            <span className="truncate text-xs text-[#A1A1AA]">{m.location || "온라인"}</span>
            <span className={`whitespace-nowrap text-xs font-black ${status === "active" ? "text-[#0F766E]" : status === "upcoming" ? "text-[#315E9B]" : "text-[#A1A1AA]"}`}>{status === "active" ? "진행중" : status === "upcoming" ? "예정" : "종료"}</span>
          </a>
        );
      })}
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
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">opportunity comparison</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">밋업 / 세미나</h1>
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
          <MeetupTable filter={currentFilter} />
        </Suspense>
      </div>
    </div>
  );
}
