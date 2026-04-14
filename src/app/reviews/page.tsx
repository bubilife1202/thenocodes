import { Suspense } from "react";
import Link from "next/link";
import { getReviews, isReviewCategory, REVIEW_CATEGORY_KO, type ReviewCategory } from "@/lib/data/reviews";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const CATEGORY_STYLE: Record<ReviewCategory, string> = {
  tool: "text-[#0F766E]",
  hackathon: "text-[#C46A1A]",
  course: "text-[#7C3AED]",
  support: "text-[#B91C1C]",
  etc: "text-[#4B5563]",
};

const TABS: { label: string; value?: ReviewCategory }[] = [
  { label: "전체" },
  { label: "도구", value: "tool" },
  { label: "해커톤", value: "hackathon" },
  { label: "강의", value: "course" },
  { label: "지원사업", value: "support" },
  { label: "기타", value: "etc" },
];

async function ReviewTable({ filter }: { filter?: ReviewCategory }) {
  const reviews = await getReviews(filter);
  if (reviews.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">등록된 후기가 없습니다. 첫 후기를 남겨보세요.</p>;
  }
  return (
    <div className="divide-y divide-[#F3F0EB] border-t border-[#ECE7DF]">
      {reviews.map((r) => (
        <article key={r.id} className="py-4">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold ${CATEGORY_STYLE[r.category]}`}>{REVIEW_CATEGORY_KO[r.category]}</span>
            <span className="text-[11px] text-[#A1A1AA]">· {r.author_name || "익명"} · {formatShortDate(r.created_at)}</span>
          </div>
          <h3 className="mt-1 text-sm font-semibold text-[#18181B]">{r.title}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#6B6760]">{r.body}</p>
          {r.related_url && (
            <a href={r.related_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] text-[#0F766E] hover:underline">
              관련 링크 →
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string }> }) {
  const params = await searchParams;
  const currentFilter = isReviewCategory(params.category) ? params.category : undefined;
  const statusMessage = params.status === "ok" ? "후기가 접수되었습니다. 검수 후 공개됩니다." : params.status === "error" ? "제출에 실패했습니다." : null;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">사용 후기</h1>
        <div className="ml-auto flex items-center gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/reviews?category=${tab.value}` : "/reviews"}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                currentFilter === tab.value ? "bg-[#18181B] text-white" : "text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <Link href="/reviews/new" className="rounded-md bg-[#0F766E] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#0B5F58]">
            글쓰기
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 rounded-lg border border-[#D9EFEA] bg-[#F6FCFB] px-3 py-2 text-sm text-[#0F766E]">
          {statusMessage}
        </div>
      )}

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <ReviewTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
