import { Suspense } from "react";
import Link from "next/link";
import { getCommunityPosts, isPostType, POST_TYPE_KO, type CommunityPostType } from "@/lib/data/community";
import { getDateLabel } from "@/lib/utils/date";
import { relativeTime } from "@/lib/utils/date";
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

const TABS: { label: string; value?: CommunityPostType }[] = [
  { label: "전체" },
  { label: "써봤어요", value: "used_it" },
  { label: "발견했어요", value: "found_it" },
  { label: "질문있어요", value: "question" },
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

async function CommunityList({ filter }: { filter?: CommunityPostType }) {
  const posts = await getCommunityPosts(filter);

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
              <div
                key={post.id}
                className="flex gap-3 rounded-2xl border border-[#F3F0EB] bg-white p-4 transition-colors hover:border-[#ECE7DF]"
              >
                <VoteButton postId={post.id} initialCount={post.vote_count} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${POST_TYPE_STYLE[post.post_type]}`}>
                      {POST_TYPE_KO[post.post_type]}
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
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
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = isPostType(params.type) ? params.type : undefined;

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

      <div className="mt-6 mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-black tracking-tight text-[#18181B]">커뮤니티</h1>

        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={tab.value ? `/community?type=${tab.value}` : "/community"}
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
        <CommunityList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
