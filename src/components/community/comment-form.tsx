"use client";

import { useFormStatus } from "react-dom";
import { submitComment } from "@/app/community/[id]/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl bg-[#18181B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2D2D30] ${pending ? "cursor-wait opacity-60" : ""}`}
    >
      {pending ? "등록 중..." : "등록"}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  return (
    <form action={submitComment} className="mt-4 space-y-3">
      <input type="hidden" name="post_id" value={postId} />
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <textarea
        name="body"
        required
        minLength={2}
        maxLength={1000}
        rows={3}
        placeholder="댓글을 남겨주세요"
        className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
      />

      <div className="flex items-center gap-3">
        <input
          type="text"
          name="author_name"
          maxLength={40}
          placeholder="닉네임 (선택)"
          className="w-40 rounded-xl border border-[#E7E0D7] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
        <SubmitButton />
      </div>
    </form>
  );
}
