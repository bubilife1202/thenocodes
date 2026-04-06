"use client";

import { signOut } from "@/lib/actions/auth";
import type { User } from "@/lib/types";
import Link from "next/link";

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-300">{user.display_name ?? user.username}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}

export function LoginButton() {
  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
    >
      로그인
    </Link>
  );
}
