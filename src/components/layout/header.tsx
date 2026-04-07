import Link from "next/link";
import { getCurrentUser } from "@/lib/data/users";
import { UserMenu, LoginButton } from "@/components/auth/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { getDictionary } from "@/lib/i18n";

export async function Header() {
  const [user, dict] = await Promise.all([
    getCurrentUser(),
    getDictionary("ko"),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.03] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-[15px] font-black tracking-tight text-[#18181B] hover:text-black transition-colors">
            THE NOCODES<span className="text-[#14B8A6]">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/challenges" className="text-[13px] font-bold text-[#71717A] hover:text-black transition-colors tracking-tight">{dict.navigation.challenges}</Link>
            <Link href="/hackathons" className="text-[13px] font-bold text-[#71717A] hover:text-black transition-colors tracking-tight">Hackathons</Link>
            <Link href="/leaderboard" className="text-[13px] font-bold text-[#71717A] hover:text-black transition-colors tracking-tight">{dict.navigation.showcase}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {user ? <UserMenu user={user} /> : <LoginButton />}
          </div>
          <MobileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
