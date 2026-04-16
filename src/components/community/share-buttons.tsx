"use client";

import { useState } from "react";

export function ShareButtons({ postId, title }: { postId: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://thenocodes.org/community/${postId}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback ignored */
    }
  }

  function shareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener"
    );
  }

  function shareKakao() {
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1 rounded-lg border border-[#ECE7DF] px-2.5 py-1.5 text-[11px] font-semibold text-[#6B6760] transition-colors hover:bg-[#F8F5F0]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {copied ? "복사됨!" : "링크 복사"}
      </button>
      <button
        type="button"
        onClick={shareTwitter}
        className="inline-flex items-center gap-1 rounded-lg border border-[#ECE7DF] px-2.5 py-1.5 text-[11px] font-semibold text-[#6B6760] transition-colors hover:bg-[#F8F5F0]"
      >
        𝕏
      </button>
      <button
        type="button"
        onClick={shareKakao}
        className="inline-flex items-center gap-1 rounded-lg border border-[#ECE7DF] px-2.5 py-1.5 text-[11px] font-semibold text-[#6B6760] transition-colors hover:bg-[#FFF8ED]"
      >
        카카오
      </button>
    </div>
  );
}
