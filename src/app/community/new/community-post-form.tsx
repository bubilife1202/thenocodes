"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitCommunityPost } from "../actions";
import type { CommunityPostType } from "@/lib/data/community";

const NICKNAME_KEY = "community_nickname";

const POST_TYPES: { value: CommunityPostType; label: string; desc: string; color: string }[] = [
  { value: "used_it", label: "써봤어요", desc: "도구/에이전트 사용 후기", color: "border-[#0F766E] bg-[#F3FBF9] text-[#0F766E]" },
  { value: "found_it", label: "발견했어요", desc: "링크 공유", color: "border-[#C46A1A] bg-[#FFF8ED] text-[#C46A1A]" },
  { value: "question", label: "질문있어요", desc: "Q&A", color: "border-[#7C3AED] bg-[#F6F0FF] text-[#7C3AED]" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2D2D30] ${pending ? "cursor-wait opacity-60" : ""}`}
    >
      {pending ? "등록 중..." : "등록하기"}
    </button>
  );
}

export function CommunityPostForm() {
  const [postType, setPostType] = useState<CommunityPostType>("used_it");
  const [nickname, setNickname] = useState("");
  const linkRequired = postType === "found_it";

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) setNickname(saved);
  }, []);

  function handleNicknameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setNickname(value);
    if (value.trim()) {
      localStorage.setItem(NICKNAME_KEY, value.trim());
    }
  }

  return (
    <form action={submitCommunityPost} className="mt-6 space-y-5">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">
          분류
        </label>
        <div className="flex gap-2">
          {POST_TYPES.map((t) => (
            <label
              key={t.value}
              className={`flex-1 cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center transition-colors ${
                postType === t.value
                  ? t.color
                  : "border-[#ECE7DF] bg-white text-[#A1A1AA] hover:border-[#D7D0C7]"
              }`}
            >
              <input
                type="radio"
                name="post_type"
                value={t.value}
                checked={postType === t.value}
                onChange={() => setPostType(t.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold">{t.label}</span>
              <span className="block text-[11px] opacity-70">{t.desc}</span>
            </label>
          ))}
        </div>
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
          닉네임 <span className="font-normal normal-case tracking-normal">(자동 기억됨)</span>
        </label>
        <input
          type="text"
          name="author_name"
          maxLength={40}
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="익명으로 표시됩니다"
          className="w-full rounded-xl border border-[#E7E0D7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#C4BDB4]"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
