import Link from "next/link";
import { getActiveChallenges } from "@/lib/data/challenges";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export async function ActiveChallenges() {
  const challenges = await getActiveChallenges();
  const displayed = challenges.slice(0, 4);

  if (displayed.length === 0) {
    return (
      <div className="py-12 px-6 border border-dashed border-black/[0.05] rounded-xl text-center">
        <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">진행 중인 챌린지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {displayed.map((challenge) => (
        <Link
          key={challenge.id}
          href={`/challenges/${challenge.slug}`}
          className="group flex flex-col md:flex-row md:items-center justify-between p-5 border border-black/[0.05] rounded-xl hover:border-black/[0.15] hover:bg-black/[0.01] transition-all"
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/[0.03] text-[#71717A]">
                {CATEGORY_LABELS[challenge.category]}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                {DIFFICULTY_LABELS[challenge.difficulty]}
              </span>
            </div>
            <h3 className="text-[15px] font-bold text-[#18181B] group-hover:text-black transition-colors mb-1 truncate">
              {challenge.title}
            </h3>
            <p className="text-[13px] text-[#71717A] line-clamp-1 font-medium">
              {challenge.description}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-6 shrink-0">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] font-bold text-[#A1A1AA]">
                  👤
                </div>
              ))}
            </div>
            <div className="text-[11px] font-bold text-[#18181B] flex items-center gap-1">
              참여하기 <span className="text-lg">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
