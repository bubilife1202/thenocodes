"use client";

import { useState } from "react";
import type { CommunityComment } from "@/lib/data/community";
import { relativeTime } from "@/lib/utils/date";
import { CommentForm } from "./comment-form";

function buildTree(comments: CommunityComment[]) {
  const roots: CommunityComment[] = [];
  const childMap = new Map<string, CommunityComment[]>();

  for (const c of comments) {
    if (!c.parent_id) {
      roots.push(c);
    } else {
      const children = childMap.get(c.parent_id) ?? [];
      children.push(c);
      childMap.set(c.parent_id, children);
    }
  }

  return { roots, childMap };
}

function CommentNode({
  comment,
  childMap,
  postId,
  depth,
}: {
  comment: CommunityComment;
  childMap: Map<string, CommunityComment[]>;
  postId: string;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const children = childMap.get(comment.id) ?? [];

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-[#F3F0EB] pl-4" : ""}>
      <div className="rounded-xl border border-[#F3F0EB] bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
          {comment.source === "api" && (
            <span role="img" aria-label="에이전트 댓글">🤖</span>
          )}
          <span className="font-semibold text-[#6B6760]">{comment.author_name || "익명"}</span>
          <span>·</span>
          <span>{relativeTime(comment.created_at)}</span>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-[#4A4640]">
          {comment.body}
        </p>
        {depth < 2 && (
          <button
            type="button"
            onClick={() => setShowReply(!showReply)}
            className="mt-2 text-[11px] font-semibold text-[#A1A1AA] hover:text-[#0F766E]"
          >
            {showReply ? "취소" : "답글"}
          </button>
        )}
      </div>

      {showReply && (
        <div className="ml-2 mt-2">
          <CommentForm postId={postId} parentId={comment.id} />
        </div>
      )}

      {children.length > 0 && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              childMap={childMap}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ comments, postId }: { comments: CommunityComment[]; postId: string }) {
  if (comments.length === 0) return null;

  const { roots, childMap } = buildTree(comments);

  return (
    <div className="space-y-3">
      {roots.map((c) => (
        <CommentNode key={c.id} comment={c} childMap={childMap} postId={postId} depth={0} />
      ))}
    </div>
  );
}
