import { Suspense } from "react";
import Link from "next/link";
import { SignalCard } from "@/components/signal-card";
import { getSignals, isSignalType } from "@/lib/data/signals";
import type { SignalType } from "@/lib/signals/constants";

export const revalidate = 300;

const TABS: { label: string; value?: SignalType }[] = [
  { label: "전체" },
  { label: "플랫폼", value: "platform_launch" },
  { label: "API·도구", value: "api_tool" },
  { label: "오픈소스", value: "open_model" },
  { label: "정책", value: "policy" },
];

async function SignalList({ filter }: { filter?: SignalType }) {
  const signals = await getSignals(filter);

  if (signals.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ECE7DF] bg-white px-6 py-16 text-center text-[#A1A1AA]">
        <p className="mb-1 font-bold text-[#18181B]">아직 등록된 흐름이 없습니다</p>
        <p className="text-sm">빌더가 챙겨야 할 변화가 들어오면 바로 정리합니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {signals.map((item) => (
        <SignalCard key={item.id} item={item} />
      ))}
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#C46A1A]">Signals</p>
        <h1 className="mb-2 text-2xl font-black tracking-tight text-[#18181B] sm:text-3xl">흐름</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#71717A] sm:text-base">
          플랫폼 런칭, API 도구, 오픈모델, 정책 변화를 빌더 관점에서 빠르게 정리합니다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/signals?type=${tab.value}` : "/signals"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              currentFilter === tab.value
                ? "bg-[#18181B] text-white"
                : "border border-[#ECE7DF] bg-white text-[#6B6760] hover:border-[#DDD6FE] hover:text-[#7C3AED]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-xl border border-[#ECE7DF] bg-white" />
            ))}
          </div>
        }
      >
        <SignalList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
