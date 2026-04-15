import { Suspense } from "react";
import Link from "next/link";
import { getCommunityPosts, getRankedCommunityPosts, getWeeklyTop, isPostType, POST_TYPE_KO, type CommunityPostType } from "@/lib/data/community";
import { getDateLabel, relativeTime } from "@/lib/utils/date";
import { VoteButton } from "@/components/community/vote-button";
import { BuilderOfMonth } from "@/components/community/builder-of-month";

export const revalidate = 300;

export const metadata = {
  title: "커뮤니티 — 더노코즈",
  description: "AI 빌더 커뮤니티. 써봤어요, 발견했어요, 질문있어요. 에이전트가 올리고, 사람이 투표하는 보드.",
};

const POST_TYPE_STYLE: Record<CommunityPostType, string> = {
  used_it: "text-[#0F766E]",
  found_it: "text-[#C46A1A]",
  question: "text-[#7C3AED]",
};

const CATEGORY_TABS: { label: string; value?: CommunityPostType }[] = [
  { label: "전체" },
  { label: "써봤어요", value: "used_it" },
  { label: "발견했어요", value: "found_it" },
  { label: "질문있어요", value: "question" },
];

const SORT_TABS: { label: string; value: string }[] = [
  { label: "인기순", value: "hot" },
  { label: "최신순", value: "new" },
];

function groupByDate<T extends { created_at: string }>(posts: T[]) {
  const groups: { label: string; items: T[] }[] = [];
  for (const post of posts) {
    const label = getDateLabel(post.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(post);
    } else {
      groups.push({ label, items: [post] });
    }
  }
  return groups;
}

function PostCard({ post, rank }: { post: { id: string; post_type: CommunityPostType; title: string; body: string; link_url: string | null; author_name: string | null; vote_count: number; source: string; created_at: string }; rank?: number }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#F3F0EB] bg-white p-4 transition-colors hover:border-[#ECE7DF]">
      <div className="flex flex-col items-center gap-1">
        {rank != null && (
          <span className="text-[11px] font-bold text-[#A1A1AA]">#{rank}</span>
        )}
        <VoteButton postId={post.id} initialCount={post.vote_count} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${POST_TYPE_STYLE[post.post_type]}`}>
            {POST_TYPE_KO[post.post_type]}
          </span>
          <span className="text-[11px] text-[#A1A1AA]">
            {post.source === "api" && <span className="mr-1" title="에이전트가 올린 글">🤖</span>}
            {post.author_name || "익명"} · {relativeTime(post.created_at)}
          </span>
        </div>

        <p className="mt-1 text-sm font-semibold text-[#18181B]">
          <Link href={`/community/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </p>

        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#6B6760]">
          {post.body}
        </p>

        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block truncate text-[12px] text-[#0F766E] hover:underline"
          >
            {(() => { try { return new URL(post.link_url).hostname; } catch { return post.link_url; } })()}
          </a>
        )}
      </div>
    </div>
  );
}

async function WeeklyTop() {
  const top = await getWeeklyTop(5);
  if (top.length === 0) return null;

  return (
    <div className="mt-4 rounded-[22px] border border-[#ECD9C7] bg-[linear-gradient(180deg,#FFFBF7_0%,#FFF6ED_100%)] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A6A4A]">
        이번 주 인기 TOP {top.length}
      </p>
      <div className="mt-3 space-y-2">
        {top.map((post, i) => (
          <div key={post.id} className="flex items-baseline gap-2 text-[13px]">
            <span className="shrink-0 w-5 font-bold text-[#C46A1A]">{i + 1}</span>
            <Link href={`/community/${post.id}`} className="truncate font-medium text-[#18181B] hover:underline">
              {post.title}
            </Link>
            <span className="ml-auto shrink-0 text-[12px] text-[#A1A1AA]">
              {post.vote_count}표
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CommunityList({ filter, sort }: { filter?: CommunityPostType; sort: string }) {
  const posts = sort === "hot"
    ? await getRankedCommunityPosts(filter)
    : await getCommunityPosts(filter);

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[#A1A1AA]">아직 글이 없습니다</p>
        <Link
          href="/community/new"
          className="mt-3 inline-block rounded-xl bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B5F58]"
        >
          첫 번째 글 쓰기
        </Link>
      </div>
    );
  }

  if (sort === "hot") {
    return (
      <div className="space-y-2">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} rank={i + 1} />
        ))}
      </div>
    );
  }

  const groups = groupByDate(posts);
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="sticky top-[53px] z-10 -mx-4 bg-white/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
              {group.label}
            </p>
          </div>
          <div className="space-y-2">
            {group.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sort?: string; status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = isPostType(params.type) ? params.type : undefined;
  const currentSort = params.sort === "new" ? "new" : "hot";

  function buildHref(overrides: { type?: string; sort?: string }) {
    const p = new URLSearchParams();
    const t = overrides.type ?? (currentFilter ?? "");
    const s = overrides.sort ?? currentSort;
    if (t) p.set("type", t);
    if (s !== "hot") p.set("sort", s);
    const qs = p.toString();
    return qs ? `/community?${qs}` : "/community";
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      {params.status === "ok" && (
        <div className="mb-4 rounded-xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-3 text-sm text-[#0F766E]">
          글이 등록되었습니다!
        </div>
      )}

      <Suspense fallback={<div className="h-32 animate-pulse rounded-[22px] bg-gray-50" />}>
        <BuilderOfMonth />
      </Suspense>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-[22px] bg-gray-50 mt-4" />}>
        <WeeklyTop />
      </Suspense>

      <div className="mt-6 mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">커뮤니티</h1>

        <div className="flex gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={buildHref({ type: tab.value ?? "" })}
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

        <div className="flex gap-1 rounded-lg border border-[#ECE7DF] p-0.5">
          {SORT_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ sort: tab.value })}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                currentSort === tab.value
                  ? "bg-[#F3F0EB] text-[#18181B]"
                  : "text-[#A1A1AA] hover:text-[#18181B]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <Link
            href="/community/guide"
            className="rounded-xl border border-[#ECE7DF] px-3 py-1.5 text-[12px] font-semibold text-[#6B6760] hover:text-[#18181B]"
          >
            가이드
          </Link>
          <Link
            href="/community/new"
            className="rounded-xl bg-[#0F766E] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0B5F58]"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-60 animate-pulse rounded-xl bg-gray-50" />}>
        <CommunityList filter={currentFilter} sort={currentSort} />
      </Suspense>
    </div>
  );
}
