import { Suspense } from "react";
import Link from "next/link";
import { getReviews, isReviewCategory, REVIEW_CATEGORY_KO, type ReviewCategory, type ReviewPost } from "@/lib/data/reviews";
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

function ReviewList({ reviews }: { reviews: ReviewPost[] }) {
  if (reviews.length === 0) {
    return <p className="rounded-[24px] border border-[#ECE7DF] bg-white py-12 text-center text-sm text-[#A1A1AA]">등록된 후기가 없습니다. 첫 후기를 남겨보세요.</p>;
  }

  return (
    <div className="divide-y divide-[#F3F0EB]">
      {reviews.map((r) => (
        <article key={r.id} className="grid gap-2 px-1 py-4 sm:grid-cols-[82px_minmax(0,1fr)_110px] sm:items-start">
          <span className={`text-[11px] font-black ${CATEGORY_STYLE[r.category]}`}>{REVIEW_CATEGORY_KO[r.category]}</span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#18181B]">{r.title}</h3>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#6B6760]">{r.body}</p>
            {r.related_url && (
              <a href={r.related_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] font-bold text-[#0F766E] hover:underline">관련 링크 →</a>
            )}
          </div>
          <span className="text-xs text-[#A1A1AA] sm:text-right">{r.author_name || "익명"}<br />{formatShortDate(r.created_at)}</span>
        </article>
      ))}
    </div>
  );
}

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string }> }) {
  const params = await searchParams;
  const currentFilter = isReviewCategory(params.category) ? params.category : undefined;
  const statusMessage = params.status === "ok" ? "후기가 접수되었습니다. 검수 후 공개됩니다." : params.status === "error" ? "제출에 실패했습니다." : null;
  const reviews = await getReviews(currentFilter);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F766E]">builder reviews</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#18181B]">사용 후기</h1>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => (
              <Link
                key={tab.label}
                href={tab.value ? `/reviews?category=${tab.value}` : "/reviews"}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  currentFilter === tab.value ? "bg-[#18181B] text-white" : "text-[#A1A1AA] hover:text-[#18181B]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <Link href="/reviews/new" className="whitespace-nowrap rounded-md bg-[#0F766E] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#0B5F58]">
              글쓰기
            </Link>
          </div>
        </div>
      </div>

      {statusMessage && <div className="mb-4 rounded-lg border border-[#D9EFEA] bg-[#F6FCFB] px-3 py-2 text-sm text-[#0F766E]">{statusMessage}</div>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <main className="min-w-0 rounded-[28px] border border-[#ECE7DF] bg-white p-5">
          <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
            <ReviewList reviews={reviews} />
          </Suspense>
        </main>
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-[22px] border border-[#D9EFEA] bg-[#F6FCFB] p-5">
            <p className="text-sm font-black text-[#123B38]">후기 프롬프트</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5C7D78]">도구, 해커톤, 강의, 지원사업을 실제로 써본 관점에서 난이도와 다음 행동을 남겨주세요.</p>
            <Link href="/reviews/new" className="mt-4 inline-flex rounded-xl bg-[#0F766E] px-4 py-2 text-sm font-bold text-white hover:bg-[#0B5F58]">후기 작성</Link>
          </div>
          <div className="rounded-[22px] border border-[#ECE7DF] bg-white p-5">
            <p className="text-sm font-black text-[#18181B]">리뷰 카테고리</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TABS.filter((tab) => tab.value).map((tab) => (
                <Link key={tab.label} href={`/reviews?category=${tab.value}`} className="rounded-2xl border border-[#F3F0EB] px-3 py-2 text-xs font-bold text-[#6B6760] hover:bg-[#F8F5F0]">
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/community" className="flex items-center justify-between rounded-[22px] border border-[#ECD9C7] bg-[#FFFBF7] p-5 text-sm font-black text-[#5F3B13] hover:bg-[#FFF6ED]">
            커뮤니티에서 토론하기 <span>→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
