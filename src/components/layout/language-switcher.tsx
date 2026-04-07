"use client";

import { useRouter } from "next/navigation";

export function LanguageSwitcher({ currentLocale }: { currentUserId?: string, currentLocale: string }) {
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = currentLocale === "ko" ? "en" : "ko";
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/[0.05] hover:bg-black/[0.03] transition-all"
    >
      <span className="text-[10px] font-black text-[#3F3F46]">
        {currentLocale === "ko" ? "🇰🇷 KO" : "🇺🇸 EN"}
      </span>
      <span className="text-[10px] text-[#A1A1AA]">/</span>
      <span className="text-[10px] font-bold text-[#A1A1AA]">
        {currentLocale === "ko" ? "EN" : "KO"}
      </span>
    </button>
  );
}
