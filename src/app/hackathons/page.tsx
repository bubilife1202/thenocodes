import { Suspense } from "react";
import Link from "next/link";
import { getOpportunities, type HackathonRow } from "@/lib/data/hackathons";
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

function daysUntil(value: string | null, now: Date) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - now.getTime()) / 86400000);
}

function deadlineText(item: HackathonRow, now: Date) {
  const end = item.ends_at;
  const daysLeft = daysUntil(end, now);
  if (daysLeft === null || !end) return "—";
  if (daysLeft <= 0) return "오늘";
  if (daysLeft <= 7) return `D-${daysLeft}`;
  return formatShortDate(end);
}

function OpportunityTable({ opportunities, now }: { opportunities: HackathonRow[]; now: Date }) {
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
            const daysLeft = daysUntil(item.ends_at, now);
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
                  <span className={daysLeft !== null && daysLeft <= 3 ? "font-semibold text-red-600" : daysLeft !== null && daysLeft <= 7 ? "font-semibold text-[#C46A1A]" : "text-[#6B6760]"}>
                    {deadlineText(item, now)}
                  </span>
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

async function OpportunityBoard({ filter }: { filter?: HackathonStatus }) {
  const [allOpportunities, visibleOpportunities] = filter
    ? await Promise.all([getOpportunities(), getOpportunities(filter)])
    : await getOpportunities().then((rows) => [rows, rows] as const);
  const now = new Date();
  const active = allOpportunities.filter((item) => getHackathonStatus(item, now) === "active");
  const upcoming = allOpportunities.filter((item) => getHackathonStatus(item, now) === "upcoming");
  const deadlineSoon = active
    .filter((item) => {
      const daysLeft = daysUntil(item.ends_at, now);
      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
    })
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryCard label="전체 기회" value={allOpportunities.length} tone="neutral" />
        <SummaryCard label="진행중" value={active.length} tone="teal" />
        <SummaryCard label="예정" value={upcoming.length} tone="blue" />
        <SummaryCard label="7일 내 마감" value={deadlineSoon.length} tone="orange" />
      </div>

      {deadlineSoon.length > 0 ? (
        <div className="rounded-2xl border border-[#F2D7BC] bg-[#FFFBF7] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#C46A1A]">deadline watch</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {deadlineSoon.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white px-4 py-3 hover:bg-[#FFF7ED]">
                <div className="flex items-center gap-2">
                  <TypeBadge category={item.category} />
                  <span className="ml-auto text-xs font-black text-red-600">{deadlineText(item, now)}</span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-bold text-[#18181B]">{item.title}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <OpportunityTable opportunities={visibleOpportunities} now={now} />
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
            <p className="mt-2 text-sm leading-6 text-[#6B6760]">해커톤과 공모전을 한 보드에서 마감순으로 비교합니다. 마감일 없는 레거시 항목은 노출하지 않습니다.</p>
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
          <OpportunityBoard filter={currentFilter} />
        </Suspense>
      </div>
    </div>
  );
}
