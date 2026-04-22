import { Suspense } from "react";
import Link from "next/link";
import { getSignals, isSignalType, type SignalRow } from "@/lib/data/signals";
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

function SignalList({ signals }: { signals: SignalRow[] }) {
  if (signals.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#A1A1AA]">
        등록된 흐름이 없습니다
      </p>
    );
  }

  return (
    <div className="divide-y divide-[#F3F0EB]">
      {signals.map((s) => (
        <article key={s.id} className="grid gap-2 px-1 py-3 sm:grid-cols-[82px_minmax(0,1fr)_120px_82px] sm:items-start">
          <span className={`text-[11px] font-black ${SIGNAL_TYPE_STYLE[s.signal_type] ?? "text-[#6B6760]"}`}>
            {SIGNAL_TYPE_KO[s.signal_type as SignalType] ?? s.signal_type}
          </span>
          <div className="min-w-0">
            <Link href={`/signals/${s.slug}`} className="font-semibold text-[#18181B] hover:underline">
              {s.title}
            </Link>
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#6B6760]">{s.summary}</p>
          </div>
          <span className="truncate text-xs text-[#8A8278]">{s.source_name}</span>
          <span className="text-left text-xs text-[#A1A1AA] sm:text-right">{formatShortDate(s.published_at)}</span>
        </article>
      ))}
    </div>
  );
}

export default async function SignalsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const currentFilter = isSignalType(params.type) ? params.type : undefined;
  const signals = await getSignals(currentFilter);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">builder signals</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">흐름</h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <main className="min-w-0 rounded-[28px] border border-[#ECE7DF] bg-white p-5">
          <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
            <SignalList signals={signals} />
          </Suspense>
        </main>
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-[22px] border border-[#D9EFEA] bg-[#F6FCFB] p-5">
            <p className="text-sm font-black text-[#123B38]">소스 읽는 순서</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C7D78]">플랫폼 출시, API 도구, 오픈모델, 정책, 연구를 한 번에 훑고 내 빌더 워크플로우에 반영할 항목만 골라보세요.</p>
          </div>
          <div className="rounded-[22px] border border-[#ECE7DF] bg-white p-5">
            <p className="text-sm font-black text-[#18181B]">카테고리 요약</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TABS.filter((tab) => tab.value).map((tab) => (
                <Link key={tab.label} href={`/signals?type=${tab.value}`} className="rounded-2xl border border-[#F3F0EB] px-3 py-2 text-xs font-bold text-[#6B6760] hover:bg-[#F8F5F0]">
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/signals/new" className="flex items-center justify-between rounded-[22px] border border-[#ECD9C7] bg-[#FFFBF7] p-5 text-sm font-black text-[#5F3B13] hover:bg-[#FFF6ED]">
            흐름 제보하기 <span>→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
