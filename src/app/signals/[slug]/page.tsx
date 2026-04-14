import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSignalBySlug } from "@/lib/data/signals";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const signal = await getSignalBySlug(slug);
  if (!signal) return {};
  return {
    title: `${signal.title} | 더노코즈`,
    description: signal.summary,
  };
}

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const signal = await getSignalBySlug(slug);

  if (!signal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/signals" className="text-sm text-[#6B6760] hover:text-black">
        ← 흐름 전체
      </Link>

      <article className="mt-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-semibold text-[#7C3AED]">
            {SIGNAL_TYPE_KO[signal.signal_type] ?? signal.signal_type}
          </span>
          <span className="text-[#A1A1AA]">
            {signal.source_name} · {formatShortDate(signal.published_at)}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-black tracking-tight text-[#18181B]">
          {signal.title}
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-[#4B5563]">
          {signal.summary}
        </p>

        <div className="mt-6 rounded-[22px] border border-[#DDD6FE] bg-[#FAF7FF] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7C3AED]">
            빌더가 당장 해볼 것
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[#18181B]">
            {signal.action_point}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {signal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F5F3EF] px-2.5 py-1 text-[11px] text-[#6B6760]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <a
          href={signal.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2A2A2A]"
        >
          원문 보기 → {signal.source_name}
        </a>
      </article>
    </div>
  );
}
