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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="pb-2 pr-2">행사명</th>
            <th className="hidden w-24 pb-2 pr-2 sm:table-cell">장소</th>
            <th className="w-24 pb-2 pr-2 text-right">날짜</th>
            <th className="hidden w-16 pb-2 sm:table-cell">출처</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F0EB]">
          {meetups.map((m) => {
            const status = getHackathonStatus(m, now);
            return (
              <tr key={m.id} className="hover:bg-[#FCFBF8]">
                <td className="py-2.5 pr-2">
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#18181B] hover:underline">
                    {m.title}
                  </a>
                  {status === "active" && <span className="ml-2 text-[10px] font-semibold text-[#0F766E]">진행중</span>}
                </td>
                <td className="hidden truncate py-2.5 pr-2 text-[#6B6760] sm:table-cell">{m.location || "서울"}</td>
                <td className="py-2.5 pr-2 text-right text-[#6B6760]">
                  {m.ends_at ? formatShortDate(m.ends_at) : m.starts_at ? formatShortDate(m.starts_at) : "—"}
                </td>
                <td className="hidden truncate py-2.5 text-[11px] text-[#A1A1AA] sm:table-cell">{m.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
