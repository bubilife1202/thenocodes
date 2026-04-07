import Link from "next/link";
import { getCurrentUser } from "@/lib/data/users";
import { getDictionary, getLocale } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export async function Sidebar() {
  const [user, dict, locale] = await Promise.all([
    getCurrentUser(),
    getDictionary(),
    getLocale(),
  ]);

  const navigation = [
    { label: dict.navigation.feed, href: "/" },
    { label: dict.navigation.challenges, href: "/challenges" },
    { label: dict.navigation.showcase, href: "/leaderboard" },
    { label: dict.navigation.insights, href: "/blog" },
    { label: dict.navigation.hackathons, href: "/hackathons" },
  ];

  const boards = [
    { label: dict.categories.singularity, href: "/challenges?category=singularity" },
    { label: dict.categories.automation, href: "/challenges?category=automation" },
    { label: dict.categories.data, href: "/challenges?category=data" },
    { label: dict.categories.tools, href: "/challenges?category=tools" },
    { label: dict.categories.prompt, href: "/challenges?category=prompt" },
  ];

  return (
    <div className="flex flex-col h-full gap-8">
      {/* 1. Main Navigation (지피터스 스타일의 굵직한 메뉴) */}
      <nav>
        <h4 className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] mb-5 px-3">
          {dict.navigation.explore}
        </h4>
        <div className="flex flex-col gap-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2.5 text-[14px] font-bold text-[#3F3F46] hover:bg-black/[0.03] rounded-xl transition-all flex items-center justify-between group"
            >
              {item.label}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">→</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 2. Board Sections (주제별 게시판) */}
      <nav>
        <h4 className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] mb-5 px-3">
          {dict.navigation.topics}
        </h4>
        <div className="flex flex-col gap-1">
          {boards.map((board) => (
            <Link
              key={board.href}
              href={board.href}
              className="px-3 py-2 text-[13px] font-medium text-[#52525B] hover:text-[#14B8A6] hover:bg-[#34D399]/5 rounded-xl transition-all"
            >
              {board.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* 3. Action / Help */}
      <div className="px-3">
        <Link 
          href="/challenges/propose"
          className="flex items-center justify-center w-full py-3 bg-[#FDFBF7] border border-black/[0.06] text-[11px] font-black text-[#3F3F46] rounded-xl hover:shadow-sm transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
        >
          {dict.navigation.propose}
        </Link>
      </div>

      {/* 4. Bottom Controls (Language & User) */}
      <div className="mt-auto pt-6 border-t border-black/[0.03] flex flex-col gap-6">
        {/* Language Toggle */}
        <div className="px-3">
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {user ? (
          <div className="px-3 pb-2">
            <div className="flex items-center gap-3 p-3 bg-white border border-black/[0.04] rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] overflow-hidden">
                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : "👤"}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-black text-[#18181B] truncate">{user.display_name ?? user.username}</p>
                <p className="text-[10px] text-[#14B8A6] font-bold">{user.total_points} PTS</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-2">
            <Link 
              href="/login"
              className="block w-full py-2.5 bg-black text-center text-[11px] font-bold text-white rounded-xl hover:bg-[#27272A] transition-all shadow-md"
            >
              {dict.navigation.start}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
