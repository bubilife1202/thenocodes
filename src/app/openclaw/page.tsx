import { Suspense } from "react";
import Link from "next/link";
import {
  getOpenclawPosts,
  isOpenclawCategory,
  isOpenclawProject,
  OPENCLAW_CATEGORY_KO,
  OPENCLAW_PROJECT_KO,
  type OpenclawCategory,
  type OpenclawProject,
} from "@/lib/data/openclaw";
import { formatShortDate } from "@/lib/utils/date";

export const revalidate = 300;

const PROJECT_STYLE: Record<OpenclawProject, string> = {
  openclaw: "border-[#CFE8E3] bg-[#F3FBF9] text-[#0F766E]",
  "hermes-agent": "border-[#D9D4FF] bg-[#F5F3FF] text-[#6D28D9]",
};

const CATEGORY_STYLE: Record<OpenclawCategory, string> = {
  official: "text-[#0F766E]",
  news: "text-[#C46A1A]",
  community: "text-[#7C3AED]",
  case: "text-[#4B5563]",
};

const PROJECT_TABS: { label: string; value?: OpenclawProject }[] = [
  { label: "전체" },
  { label: "OpenClaw", value: "openclaw" },
  { label: "Hermes Agent", value: "hermes-agent" },
];

const CATEGORY_TABS: { label: string; value?: OpenclawCategory }[] = [
  { label: "전체" },
  { label: "공식", value: "official" },
  { label: "뉴스", value: "news" },
  { label: "커뮤니티", value: "community" },
  { label: "사례", value: "case" },
];

function boardHref(project?: OpenclawProject, category?: OpenclawCategory) {
  const params = new URLSearchParams();
  if (project) params.set("project", project);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/openclaw?${query}` : "/openclaw";
}

async function OpenclawTable({ project, category }: { project?: OpenclawProject; category?: OpenclawCategory }) {
  const posts = await getOpenclawPosts(project, category);

  if (posts.length === 0) {
    return <p className="py-12 text-center text-sm text-[#A1A1AA]">등록된 글이 없습니다</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#ECE7DF] text-[11px] font-bold text-[#A1A1AA]">
            <th className="w-28 pb-2 pr-2">프로젝트</th>
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
                <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PROJECT_STYLE[p.project]}`}>
                  {OPENCLAW_PROJECT_KO[p.project]}
                </span>
              </td>
              <td className="py-2.5 pr-2">
                <span className={`whitespace-nowrap text-[11px] font-semibold ${CATEGORY_STYLE[p.category]}`}>
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

export default async function OpenclawPage({ searchParams }: { searchParams: Promise<{ project?: string; category?: string }> }) {
  const params = await searchParams;
  const currentProject = isOpenclawProject(params.project) ? params.project : undefined;
  const currentCategory = isOpenclawCategory(params.category) ? params.category : undefined;

  return (
    <div className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline">
          <h1 className="text-xl font-black tracking-tight text-[#18181B]">OpenClaw / Hermes</h1>
          <span className="text-xs text-[#A1A1AA]">개인 AI 에이전트 플랫폼과 Hermes Agent 업데이트</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B0AAA2]">project</span>
          {PROJECT_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={boardHref(tab.value, currentCategory)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                currentProject === tab.value ? "bg-[#18181B] text-white" : "text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B0AAA2]">type</span>
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={boardHref(currentProject, tab.value)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                currentCategory === tab.value ? "bg-[#18181B] text-white" : "text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <OpenclawTable project={currentProject} category={currentCategory} />
      </Suspense>
    </div>
  );
}
