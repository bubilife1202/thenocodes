import { Suspense } from "react";
import Link from "next/link";
import { getSignals, isSignalType } from "@/lib/data/signals";
import type { SignalType } from "@/lib/signals/constants";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const SIGNAL_TYPE_KO: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API",
  open_model: "오픈모델",
  policy: "정책",
  research: "연구",
};

const SIGNAL_TYPE_STYLE: Record<SignalType, string> = {
  platform_launch: "text-[#0F766E]",
  api_tool: "text-[#C46A1A]",
  open_model: "text-[#7C3AED]",
  policy: "text-[#B91C1C]",
  research: "text-[#4B5563]",
};

const TABS: { label: string; value?: SignalType }[] = [
  { label: "전체" },
  { label: "플랫폼", value: "platform_launch" },
  { label: "API", value: "api_tool" },
  { label: "오픈모델", value: "open_model" },
  { label: "정책", value: "policy" },
  { label: "연구", value: "research" },
];

async function SignalTable({ filter }: { filter?: SignalType }) {
  const signals = await getSignals(filter);

  if (signals.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">등록된 흐름이 없습니다</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="w-16 pb-2 pr-2">유형</th>
            <th className="pb-2 pr-2">제목</th>
            <th className="hidden w-24 pb-2 pr-2 sm:table-cell">출처</th>
            <th className="w-20 pb-2 text-right">날짜</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F0EB]">
          {signals.map((s) => (
            <tr key={s.id} className="hover:bg-[#FCFBF8]">
              <td className="py-2.5 pr-2">
                <span className={`text-[11px] font-semibold ${SIGNAL_TYPE_STYLE[s.signal_type] ?? "text-[#6B6760]"}`}>
                  {SIGNAL_TYPE_KO[s.signal_type as SignalType] ?? s.signal_type}
                </span>
              </td>
              <td className="py-2.5 pr-2">
                <div>
                  <Link href={`/signals/${s.slug}`} className="font-medium text-[#18181B] hover:underline">
                    {s.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6B6760]">{s.summary}</p>
                </div>
              </td>
              <td className="hidden truncate py-2.5 pr-2 text-[#6B6760] sm:table-cell">{s.source_name}</td>
              <td className="py-2.5 text-right text-[#A1A1AA]">{formatShortDate(s.published_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = isSignalType(params.type) ? params.type : undefined;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">흐름</h1>
        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/signals?type=${tab.value}` : "/signals"}
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
        <SignalTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
