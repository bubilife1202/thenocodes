"use client";

import { useState } from "react";

export function QuickShare({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [url, setUrl] = useState("");

  if (!isLoggedIn) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 p-4 bg-white border border-[#34D399]/20 rounded-[1.5rem] shadow-sm ring-1 ring-[#34D399]/5 hover:border-[#34D399]/40 transition-all group">
        <div className="w-10 h-10 rounded-full bg-[#34D399]/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
          🔗
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="인상 깊은 AI 인사이트 링크(X, Threads 등)를 공유해주세요..."
            className="w-full bg-transparent border-none focus:ring-0 text-[13px] font-medium text-[#3F3F46] placeholder-[#A1A1AA]"
          />
        </div>
        <button
          disabled={!url}
          className="px-4 py-2 bg-black text-white text-[11px] font-black rounded-xl hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
        >
          공유하기
        </button>
      </div>
      <p className="mt-3 px-2 text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-[#14B8A6]" />
        Quick Share Insight
      </p>
    </div>
  );
}
