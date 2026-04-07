"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { User } from "@/lib/types";

export function MobileMenu({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-[#71717A] hover:text-[#3F3F46]"
        aria-label="메뉴"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 space-y-1 shadow-lg">
          <Link href="/challenges" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">챌린지</Link>
          <Link href="/leaderboard" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">리더보드</Link>
          <Link href="/blog" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">블로그</Link>
          <Link href="/hackathons" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">해커톤</Link>
          <Link href="/how-it-works" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">이용 가이드</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">소개</Link>
          <Link href="/challenges/propose" onClick={() => setOpen(false)} className="block px-4 py-3 text-[#3F3F46] hover:text-[#14B8A6] hover:bg-gray-50 rounded-lg">문제 제안</Link>
          <div className="border-t border-gray-200 pt-3 mt-3">
            {user ? (
              <div className="flex items-center justify-between px-4">
                <Link href={`/profile/${user.username}`} onClick={() => setOpen(false)} className="text-sm text-[#3F3F46] hover:text-[#14B8A6]">
                  {user.display_name ?? user.username} · {user.total_points}pts
                </Link>
                <form action={signOut}>
                  <button type="submit" className="text-sm text-[#71717A] hover:text-[#3F3F46]">로그아웃</button>
                </form>
              </div>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-center bg-[#3F3F46] hover:bg-[#27272A] text-white rounded-lg font-medium">로그인</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
