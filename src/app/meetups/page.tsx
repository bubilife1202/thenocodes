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
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Seoul",
      }).format(new Date(startsAt)) ===
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Seoul",
      }).format(new Date(endsAt));

    if (sameDay) {
      return {
        date: formatShortDate(startsAt),
        time: `${KR_TIME.format(new Date(startsAt))} - ${KR_TIME.format(new Date(endsAt))}`,
      };
    }

    return {
      date: `${formatShortDate(startsAt)} - ${formatShortDate(endsAt)}`,
      time: `${KR_TIME.format(new Date(startsAt))} - ${KR_TIME.format(new Date(endsAt))}`,
    };
  }

  if (startsAt) {
    return {
      date: formatShortDate(startsAt),
      time: KR_TIME.format(new Date(startsAt)),
    };
  }

  if (endsAt) {
    return {
      date: formatShortDate(endsAt),
      time: KR_TIME.format(new Date(endsAt)),
    };
  }

  return { date: "미정", time: "시간 미정" };
}

async function MeetupTable({ filter }: { filter?: HackathonStatus }) {
  const meetups = await getMeetups(filter);
  const now = new Date();

  if (meetups.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">밋업이 없습니다</p>;
  }

  // 날짜별 그룹핑
  const groups = new Map<string, typeof meetups>();
  for (const m of meetups) {
    const key = m.starts_at ? formatShortDate(m.starts_at) : "날짜 미정";
    const arr = groups.get(key) ?? [];
    arr.push(m);
    groups.set(key, arr);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([date, items]) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">{date}</p>
            <div className="h-px flex-1 bg-[#ECE7DF]" />
          </div>

          <div className="divide-y divide-[#F3F0EB]">
            {items.map((m) => {
              const status = getHackathonStatus(m, now);
              const schedule = formatSchedule(m.starts_at, m.ends_at);

              return (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-2 block rounded-lg px-2 py-3 transition-colors hover:bg-[#FCFBF8]"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="w-14 shrink-0 text-[12px] font-semibold text-[#6B6760]">
                      {schedule.time}
                    </span>
                    <h3 className="flex-1 text-[15px] font-bold leading-snug text-[#18181B]">
                      {m.title}
                    </h3>
                    {status === "active" && (
                      <span className="shrink-0 rounded-full bg-[#F3FBF9] px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">진행중</span>
                    )}
                    {status === "upcoming" && (
                      <span className="shrink-0 rounded-full bg-[#F4F8FE] px-2 py-0.5 text-[10px] font-bold text-[#315E9B]">예정</span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[68px] text-[12px] text-[#8A8278]">
                    {m.location && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-[#C4BDB4]">·</span>
                        {m.location}
                      </span>
                    )}
                    {m.organizer && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-[#C4BDB4]">·</span>
                        {m.organizer}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[#A1A1AA]">
                      <span className="text-[#C4BDB4]">·</span>
                      {m.source}
                    </span>
                  </div>

                  {m.description && (
                    <p className="mt-1.5 pl-[68px] text-[12px] leading-relaxed text-[#8A8278] line-clamp-2">
                      {m.description}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function MeetupsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "진행중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">밋업 / 세미나</h1>
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/meetups?status=${tab.value}` : "/meetups"}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
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

      <p className="mb-5 text-sm text-[#6B6760]">
        서울 기준으로 열리는 AI 밋업과 세미나를 중심으로, 장소 · 일정 · 시간 · 핵심 내용을 바로 보이게 정리했습니다.
      </p>

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <MeetupTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
