import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCommunityPostById, getCommentsByPostId, POST_TYPE_KO } from "@/lib/data/community";
import { CommentList } from "@/components/community/comment-list";
import { CommentForm } from "@/components/community/comment-form";
import { ShareButtons } from "@/components/community/share-buttons";
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ comment?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [post, comments] = await Promise.all([
    getCommunityPostById(id),
    getCommentsByPostId(id),
  ]);
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
          <div className="mt-4">
            <ShareButtons postId={post.id} title={post.title} />
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="mt-8 border-t border-[#ECE7DF] pt-6">
        <h2 className="text-sm font-bold text-[#18181B]">
          댓글 {comments.length > 0 && <span className="font-normal text-[#A1A1AA]">{comments.length}</span>}
        </h2>

        {sp.comment === "ok" && (
          <div className="mt-3 rounded-xl border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-2.5 text-sm text-[#0F766E]">
            댓글이 등록되었습니다.
          </div>
        )}
        {sp.comment === "error" && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            댓글 등록에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {comments.length > 0 ? (
          <div className="mt-4">
            <CommentList comments={comments} postId={post.id} />
          </div>
        ) : (
          <p className="mt-4 text-center text-[13px] text-[#A1A1AA]">
            아직 댓글이 없습니다. 첫 번째 댓글을 남겨주세요!
          </p>
        )}

        <CommentForm postId={post.id} />
      </div>
    </div>
  );
}
