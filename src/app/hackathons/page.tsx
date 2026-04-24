import { Suspense } from "react";
import Link from "next/link";
import { getOpportunities } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

function StatusBadge({ status }: { status: HackathonStatus }) {
  if (status === "active") return <span className="whitespace-nowrap rounded-full bg-[#F3FBF9] px-2 py-1 text-[11px] font-black text-[#0F766E]">진행중</span>;
  if (status === "upcoming") return <span className="whitespace-nowrap rounded-full bg-[#F4F8FE] px-2 py-1 text-[11px] font-black text-[#315E9B]">예정</span>;
  return <span className="whitespace-nowrap rounded-full bg-[#F4F1ED] px-2 py-1 text-[11px] text-[#A1A1AA]">마감</span>;
}

function TypeBadge({ category }: { category: string }) {
  const isContest = category === "contest";
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-black ${isContest ? "bg-[#FFF7ED] text-[#C46A1A]" : "bg-[#F3FBF9] text-[#0F766E]"}`}>
      {isContest ? "공모전" : "해커톤"}
    </span>
  );
}

async function OpportunityTable({ filter }: { filter?: HackathonStatus }) {
  const opportunities = await getOpportunities(filter);
  const now = new Date();

  if (opportunities.length === 0) return <p className="py-12 text-center text-sm text-[#A1A1AA]">등록된 기회가 없습니다</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="w-14 whitespace-nowrap pb-2 pr-2">상태</th>
            <th className="w-16 whitespace-nowrap pb-2 pr-2">유형</th>
            <th className="pb-2 pr-2">제목</th>
            <th className="hidden w-28 pb-2 pr-2 sm:table-cell">주최</th>
            <th className="w-24 whitespace-nowrap pb-2 pr-2 text-right">마감</th>
            <th className="hidden w-20 pb-2 pr-2 sm:table-cell">장소</th>
            <th className="hidden w-20 pb-2 text-right md:table-cell">소스</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F0EB]">
          {opportunities.map((item) => {
            const status = getHackathonStatus(item, now);
            const daysLeft = item.ends_at ? Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000) : null;
            return (
              <tr key={item.id} className="hover:bg-[#FCFBF8]">
                <td className="py-2.5 pr-2"><StatusBadge status={status} /></td>
                <td className="py-2.5 pr-2"><TypeBadge category={item.category} /></td>
                <td className="py-2.5 pr-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#18181B] hover:underline">
                    {item.title}
                  </a>
                </td>
                <td className="hidden truncate py-2.5 pr-2 text-[#6B6760] sm:table-cell">{item.organizer || "—"}</td>
                <td className="whitespace-nowrap py-2.5 pr-2 text-right">
                  {item.ends_at ? (
                    <span className={daysLeft !== null && daysLeft <= 3 ? "font-semibold text-red-600" : "text-[#6B6760]"}>
                      {daysLeft !== null && daysLeft <= 0 ? "오늘" : daysLeft !== null && daysLeft <= 7 ? `D-${daysLeft}` : formatShortDate(item.ends_at)}
                    </span>
                  ) : <span className="text-[#A1A1AA]">—</span>}
                </td>
                <td className="hidden truncate py-2.5 pr-2 text-[11px] text-[#A1A1AA] sm:table-cell">{item.location || "온라인"}</td>
                <td className="hidden truncate py-2.5 text-right text-[11px] text-[#A1A1AA] md:table-cell">{item.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
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
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">opportunity board</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">해커톤 · 공모전</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B6760]">해커톤과 공모전을 한 보드에서 마감순으로 비교합니다.</p>
          </div>
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.value ? `/hackathons?status=${tab.value}` : "/hackathons"}
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
        <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
          <OpportunityTable filter={currentFilter} />
        </Suspense>
      </div>
    </div>
  );
}
