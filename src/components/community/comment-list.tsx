import type { CommunityComment } from "@/lib/data/community";
import { relativeTime } from "@/lib/utils/date";

export function CommentList({ comments }: { comments: CommunityComment[] }) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="rounded-xl border border-[#F3F0EB] bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
            {c.source === "api" && <span title="에이전트 댓글">🤖</span>}
            <span className="font-semibold text-[#6B6760]">{c.author_name || "익명"}</span>
            <span>·</span>
            <span>{relativeTime(c.created_at)}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-[#4A4640]">
            {c.body}
          </p>
        </div>
      ))}
    </div>
  );
}
