import Link from "next/link";
import type { Challenge } from "@/lib/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isActive = challenge.status === "active";
  const isSponsored = challenge.source === "company";

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className={`group relative overflow-hidden p-6 md:p-8 rounded-[2rem] border transition-all ${
        isSponsored
          ? "bg-gradient-to-br from-white to-[#34D399]/5 border-[#34D399]/20 shadow-[0_4px_20px_-4px_rgba(52,211,153,0.1)] ring-1 ring-[#34D399]/10"
          : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-[#14B8A6]/20"
      } hover:-translate-y-1`}
    >
      {/* Sponsored Badge */}
      {isSponsored && (
        <div className="absolute top-0 right-0">
          <div className="bg-[#34D399] text-[#0F766E] text-[9px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest shadow-sm">
            Sponsored
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
          isActive
            ? "bg-[#14B8A6]/10 text-[#0F766E]"
            : "bg-gray-100 text-[#A1A1AA]"
        }`}>
          {isActive ? "Active" : "Closed"}
        </span>
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gray-50 text-[#71717A]">
          {CATEGORY_LABELS[challenge.category]}
        </span>
        {isSponsored && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FB923C]/10 text-[#C2410C]">
            {challenge.company_name ?? "Partner"} Quest
          </span>
        )}
      </div>

      <h3 className="text-xl font-black text-[#3F3F46] group-hover:text-[#14B8A6] transition-colors mb-3 leading-tight tracking-tight">
        {challenge.title}
      </h3>
      
      <p className="text-sm text-[#71717A] line-clamp-2 mb-6 leading-relaxed font-medium">
        {challenge.description}
      </p>

      <div className="mt-auto pt-5 border-t border-black/[0.03] flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2].map((n) => (
            <div key={n} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px]">
              👤
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-stone-400">
            +8
          </div>
        </div>
        <span className="text-[10px] font-black text-[#14B8A6] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-all">
          Join Quest <span className="text-sm">🚀</span>
        </span>
      </div>
    </Link>
  );
}
