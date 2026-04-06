import Link from "next/link";
import { getActiveChallenges } from "@/lib/data/challenges";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export async function ActiveChallenges() {
  const challenges = await getActiveChallenges();
  const displayed = challenges.slice(0, 3);

  if (displayed.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        아직 진행 중인 챌린지가 없습니다. 곧 새로운 챌린지가 시작됩니다!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {displayed.map((challenge) => (
        <Link key={challenge.id} href={`/challenges/${challenge.slug}`}
          className="group p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
              {CATEGORY_LABELS[challenge.category]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {DIFFICULTY_LABELS[challenge.difficulty]}
            </span>
          </div>
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
            {challenge.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {challenge.description.slice(0, 100)}...
          </p>
          {challenge.ends_at ? (
            <p className="text-xs text-gray-600 mt-3">
              마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
