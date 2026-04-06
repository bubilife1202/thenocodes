import Link from "next/link";
import { getCurrentUser } from "@/lib/data/users";
import { UserMenu, LoginButton } from "@/components/auth/user-menu";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            The Nocodes
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/challenges" className="text-sm text-gray-400 hover:text-white transition-colors">챌린지</Link>
            <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">리더보드</Link>
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">블로그</Link>
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">소개</Link>
          </nav>
        </div>
        {user ? <UserMenu user={user} /> : <LoginButton />}
      </div>
    </header>
  );
}
