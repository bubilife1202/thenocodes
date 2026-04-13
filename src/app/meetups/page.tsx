import { Suspense } from "react";
import Link from "next/link";
import { getMeetups } from "@/lib/data/meetups";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

async function MeetupTable({ filter }: { filter?: HackathonStatus }) {
  const meetups = await getMeetups(filter);
  const now = new Date();

  if (meetups.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">밋업이 없습니다</p>;
  }

  return (
    <div className="divide-y divide-[#F3F0EB]">
      {meetups.map((m) => {
        const status = getHackathonStatus(m, now);
        const dateStr = m.ends_at
          ? formatShortDate(m.ends_at)
          : m.starts_at
            ? formatShortDate(m.starts_at)
            : null;

        return (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 hover:bg-[#FCFBF8]"
          >
            <div className="flex items-start gap-3">
              {/* 날짜 블록 */}
              <div className="w-14 shrink-0 pt-0.5 text-center">
                {dateStr ? (
                  <span className="text-sm font-bold text-[#18181B]">{dateStr}</span>
                ) : (
                  <span className="text-sm text-[#A1A1AA]">미정</span>
                )}
              </div>

              {/* 내용 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#18181B]">{m.title}</h3>
                  {status === "active" && (
                    <span className="shrink-0 rounded bg-[#F3FBF9] px-1.5 py-0.5 text-[10px] font-bold text-[#0F766E]">진행중</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[12px] text-[#6B6760]">
                  {m.location && <span>{m.location}</span>}
                  {m.organizer && <span>{m.organizer}</span>}
                  <span className="text-[#A1A1AA]">{m.source}</span>
                </div>
                {m.description && (
                  <p className="mt-1 line-clamp-1 text-[12px] text-[#A1A1AA]">{m.description}</p>
                )}
              </div>
            </div>
          </a>
        );
      })}
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

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <MeetupTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
