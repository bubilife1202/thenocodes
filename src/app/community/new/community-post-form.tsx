"use client";

import { useState } from "react";
import { submitCommunityPost } from "../actions";
import type { CommunityPostType } from "@/lib/data/community";

const INITIAL_POST_TYPE: CommunityPostType = "used_it";

export function CommunityPostForm() {
  const [postType, setPostType] = useState<CommunityPostType>(INITIAL_POST_TYPE);
  const linkRequired = postType === "found_it";

  return (
    <form action={submitCommunityPost} className="mt-6 space-y-5">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          분류
        </label>
        <select
          name="post_type"
          required
          value={postType}
          onChange={(event) => setPostType(event.target.value as CommunityPostType)}
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B]"
        >
          <option value="used_it">써봤어요 — 도구/에이전트 사용 후기</option>
          <option value="found_it">발견했어요 — 링크 공유</option>
          <option value="question">질문있어요 — Q&amp;A</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          제목
        </label>
        <input
          type="text"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder="무엇에 대한 글인가요?"
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          내용
        </label>
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="자세히 알려주세요"
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          링크 <span className="font-normal normal-case tracking-normal">(발견했어요는 필수)</span>
        </label>
        <input
          type="url"
          name="link_url"
          required={linkRequired}
          placeholder="https://..."
          aria-describedby="community-link-help"
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
        <p
          id="community-link-help"
          className={`mt-1 text-[12px] ${linkRequired ? "font-semibold text-[#B45309]" : "text-[#A1A1AA]"}`}
        >
          {linkRequired
            ? "발견했어요 글은 공유할 링크가 꼭 필요합니다."
            : "써봤어요 / 질문있어요는 링크 없이도 등록할 수 있습니다."}
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          닉네임 <span className="font-normal normal-case tracking-normal">(선택)</span>
        </label>
        <input
          type="text"
          name="author_name"
          maxLength={40}
          placeholder="익명으로 표시됩니다"
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D2D30]"
      >
        등록하기
      </button>
    </form>
  );
}
