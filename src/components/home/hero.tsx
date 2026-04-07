import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export async function Hero() {
  const dict = await getDictionary("ko");

  return (
    <section className="px-6 py-10 md:py-14 bg-white border-b border-black/[0.03]">
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[10px] font-bold text-[#0F766E] uppercase tracking-wider mb-6">
          {dict.hero.notice}
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#18181B] leading-tight mb-5">
          {dict.hero.title_line1} <br />
          <span className="text-[#71717A]">{dict.hero.title_line2}</span>
        </h1>
        <p className="text-sm md:text-base text-[#71717A] max-w-xl font-medium leading-relaxed mb-10">
          {dict.hero.description}
        </p>
        <div className="flex gap-3">
          <Link
            href="/challenges"
            className="px-6 py-2.5 bg-black text-white text-[12px] font-bold rounded-lg hover:bg-[#27272A] transition-all shadow-sm flex items-center gap-2"
          >
            {dict.hero.btn_browse} 🚀
          </Link>
          <Link
            href="/leaderboard"
            className="px-6 py-2.5 bg-white text-[#18181B] text-[12px] font-bold rounded-lg border border-black/[0.08] hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            {dict.hero.btn_showcase}
          </Link>
        </div>
      </div>
    </section>
  );
}
