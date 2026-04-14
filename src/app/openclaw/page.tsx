import { Suspense } from "react";
import Link from "next/link";
import { getOpenclawPosts, isOpenclawCategory, OPENCLAW_CATEGORY_KO, type OpenclawCategory } from "@/lib/data/openclaw";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const CATEGORY_STYLE: Record<OpenclawCategory, string> = {
  official: "text-[#0F766E]",
  news: "text-[#C46A1A]",
  community: "text-[#7C3AED]",
  case: "text-[#4B5563]",
};

const TABS: { label: string; value?: OpenclawCategory }[] = [
  { label: "전체" },
  { label: "공식", value: "official" },
  { label: "뉴스", value: "news" },
  { label: "커뮤니티", value: "community" },
  { label: "사례", value: "case" },
];

async function OpenclawTable({ filter }: { filter?: OpenclawCategory }) {
  const posts = await getOpenclawPosts(filter);

  if (posts.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">등록된 글이 없습니다</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="w-16 pb-2 pr-2">분류</th>
            <th className="pb-2 pr-2">제목</th>
            <th className="hidden w-28 pb-2 pr-2 sm:table-cell">출처</th>
            <th className="w-20 pb-2 text-right">날짜</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F0EB]">
          {posts.map((p) => (
            <tr key={p.id} className="hover:bg-[#FCFBF8]">
              <td className="py-2.5 pr-2">
                <span className={`text-[11px] font-semibold ${CATEGORY_STYLE[p.category]}`}>
                  {OPENCLAW_CATEGORY_KO[p.category]}
                </span>
              </td>
              <td className="py-2.5 pr-2">
                <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-[#18181B] hover:underline">
                  {p.title}
                </a>
                {p.summary && <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6B6760]">{p.summary}</p>}
              </td>
              <td className="hidden truncate py-2.5 pr-2 text-[#6B6760] sm:table-cell">{p.source_name}</td>
              <td className="py-2.5 text-right text-[#A1A1AA]">{formatShortDate(p.published_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function OpenclawPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const currentFilter = isOpenclawCategory(params.category) ? params.category : undefined;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">OpenClaw</h1>
        <span className="text-xs text-[#A1A1AA]">개인 AI 에이전트 플랫폼 소식</span>
        <div className="ml-auto flex gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/openclaw?category=${tab.value}` : "/openclaw"}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                currentFilter === tab.value ? "bg-[#18181B] text-white" : "text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <OpenclawTable filter={currentFilter} />
      </Suspense>
    </div>
  );
}
