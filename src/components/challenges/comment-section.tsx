"use client";

import { createComment, deleteComment } from "@/lib/actions/comments";
import type { Comment } from "@/lib/types";
import { useRef, useState } from "react";

export function CommentSection({
  submissionId,
  challengeSlug,
  comments,
  currentUserId,
  isAdmin,
}: {
  submissionId: string;
  challengeSlug: string;
  comments: Comment[];
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createComment(formData);
      formRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] shrink-0">
              {comment.user?.avatar_url ? (
                <img src={comment.user.avatar_url} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                "👤"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-[#3F3F46]">
                    {comment.user?.display_name ?? comment.user?.username ?? "익명"}
                  </span>
                  <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-tighter">
                    {new Date(comment.created_at).toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {(currentUserId === comment.user_id || isAdmin) && (
                  <button
                    onClick={() => deleteComment(comment.id, challengeSlug)}
                    className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-red-400 hover:text-red-500 transition-all uppercase tracking-widest"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed mt-0.5">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      {currentUserId ? (
        <form ref={formRef} action={handleSubmit} className="flex gap-3 items-start">
          <input type="hidden" name="submission_id" value={submissionId} />
          <input type="hidden" name="challenge_slug" value={challengeSlug} />
          <div className="flex-1 relative">
            <input
              name="content"
              required
              placeholder="동료의 아이디어에 한마디 더하기... ☕️"
              className="w-full bg-[#FDFBF7] border border-gray-100 rounded-xl px-4 py-2 text-xs text-[#3F3F46] placeholder-[#A1A1AA] focus:outline-none focus:border-[#34D399] transition-all shadow-inner pr-12"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#14B8A6] font-black text-[10px] uppercase tracking-widest hover:text-[#0D9488] disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="text-[10px] text-[#A1A1AA] font-bold text-center italic">
          로그인 후 따뜻한 피드백을 남겨주세요 ☕️
        </p>
      )}
    </div>
  );
}
