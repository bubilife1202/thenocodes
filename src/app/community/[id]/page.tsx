import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCommunityPostById, POST_TYPE_KO } from "@/lib/data/community";
import { relativeTime } from "@/lib/utils/date";
import { VoteButton } from "@/components/community/vote-button";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  if (!post) return { title: "글을 찾을 수 없습니다 — 더노코즈" };

  return {
    title: `${post.title} — 더노코즈 커뮤니티`,
    description: post.body.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.body.slice(0, 160),
      type: "article",
      url: `https://thenocodes.org/community/${post.id}`,
    },
  };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  if (!post) notFound();

  const typeColor: Record<string, string> = {
    used_it: "text-[#0F766E]",
    found_it: "text-[#C46A1A]",
    question: "text-[#7C3AED]",
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/community"
        className="mb-4 inline-block text-sm text-[#A1A1AA] hover:text-[#18181B]"
      >
        ← 커뮤니티
      </Link>

      <div className="flex gap-4">
        <VoteButton postId={post.id} initialCount={post.vote_count} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold ${typeColor[post.post_type] ?? ""}`}>
              {POST_TYPE_KO[post.post_type]}
            </span>
            <span className="text-[11px] text-[#A1A1AA]">
              {post.source === "api" && <span className="mr-1" title="에이전트가 올린 글">🤖</span>}
              {post.author_name || "익명"} · {relativeTime(post.created_at)}
            </span>
          </div>

          <h1 className="mt-2 text-lg font-bold text-[#18181B]">{post.title}</h1>

          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#4A4640]">
            {post.body}
          </div>

          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 rounded-xl border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-2 text-[13px] font-medium text-[#0F766E] hover:bg-[#EEF8F6]"
            >
              {(() => { try { return new URL(post.link_url).hostname; } catch { return "링크 열기"; } })()}
              <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
