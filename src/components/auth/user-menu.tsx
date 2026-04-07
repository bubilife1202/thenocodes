"use client";

import { signOut } from "@/lib/actions/auth";
import type { User } from "@/lib/types";
import Link from "next/link";

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      {/* Profile & Points Link */}
      <Link 
        href={`/profile/${user.username}`} 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/[0.03] transition-all group min-w-0"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span>👋</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-black text-[#3F3F46] truncate group-hover:text-[#14B8A6] transition-colors">
            {user.display_name ?? user.username}님
          </span>
          <span className="text-[9px] font-bold text-[#F59E0B] tracking-tighter">
            {user.total_points} PTS 🌟
          </span>
        </div>
      </Link>

      {/* Logout Action */}
      <form action={signOut}>
        <button
          type="submit"
          className="text-[10px] font-bold text-[#A1A1AA] hover:text-[#3F3F46] transition-colors uppercase tracking-widest px-2 py-1"
          title="로그아웃"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export function LoginButton() {
  return (
    <Link
      href="/login"
      className="px-5 py-2 text-xs font-black text-white bg-[#3F3F46] hover:bg-[#27272A] rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
    >
      더노코즈 시작하기 <span className="text-sm">✨</span>
    </Link>
  );
}
