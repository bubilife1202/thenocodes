import { Suspense } from "react";
import Link from "next/link";
import { getContests } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

function StatusBadge({ status }: { status: HackathonStatus }) {
  if (status === "active") return <span className="w-12 text-[11px] font-semibold text-[#C46A1A]">모집중</span>;
  if (status === "upcoming") return <span className="w-12 text-[11px] font-semibold text-[#6366F1]">예정</span>;
  return <span className="w-12 text-[11px] text-[#A1A1AA]">마감</span>;
}

async function ContestTable({ filter }: { filter?: HackathonStatus }) {
  const contests = await getContests(filter);
  const now = new Date();

  if (contests.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">공모전이 없습니다</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="w-12 pb-2 pr-2">상태</th>
            <th className="pb-2 pr-2">제목</th>
            <th className="hidden w-28 pb-2 pr-2 sm:table-cell">주최</th>
            <th className="w-24 pb-2 pr-2 text-right">마감</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F0EB]">
          {contests.map((c) => {
            const status = getHackathonStatus(c, now);
            const daysLeft = c.ends_at ? Math.ceil((new Date(c.ends_at).getTime() - now.getTime()) / 86400000) : null;
            return (
              <tr key={c.id} className="hover:bg-[#FCFBF8]">
                <td className="py-2.5 pr-2"><StatusBadge status={status} /></td>
                <td className="py-2.5 pr-2">
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#18181B] hover:underline">
                    {c.title}
                  </a>
                </td>
                <td className="hidden truncate py-2.5 pr-2 text-[#6B6760] sm:table-cell">{c.organizer || "—"}</td>
                <td className="py-2.5 pr-2 text-right">
                  {c.ends_at ? (
                    <span className={daysLeft !== null && daysLeft <= 3 ? "font-semibold text-red-600" : "text-[#6B6760]"}>
                      {daysLeft !== null && daysLeft <= 0 ? "오늘" : daysLeft !== null && daysLeft <= 7 ? `D-${daysLeft}` : formatShortDate(c.ends_at)}
                    </span>
                  ) : <span className="text-[#A1A1AA]">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "모집중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">공모전</h1>
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/contests?status=${tab.value}` : "/contests"}
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
        <ContestTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
