import Link from "next/link";
import type { Challenge } from "@/lib/types";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isActive = challenge.status === "active";

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="group block p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-indigo-500/40 transition-all"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 200px" }}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isActive
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-gray-800 text-gray-500"
        }`}>
          {isActive ? "진행 중" : "마감"}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
          {CATEGORY_LABELS[challenge.category]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {DIFFICULTY_LABELS[challenge.difficulty]}
        </span>
        {challenge.source === "company" && challenge.company_name ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            {challenge.company_name}
          </span>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
        {challenge.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {challenge.description.slice(0, 150)}...
      </p>
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {challenge.starts_at ? (
          <span>시작: {new Date(challenge.starts_at).toLocaleDateString("ko-KR")}</span>
        ) : null}
        {challenge.ends_at ? (
          <span>마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}</span>
        ) : null}
      </div>
    </Link>
  );
}
