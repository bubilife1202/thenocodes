import { Suspense } from "react";
import Link from "next/link";
import { getContests, type HackathonRow } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";

const STATUS_COLORS: Record<HackathonStatus, string> = {
  active: "bg-orange-50 text-orange-700",
  upcoming: "bg-blue-50 text-blue-700",
  ended: "bg-gray-50 text-gray-400",
};

const STATUS_LABELS: Record<HackathonStatus, string> = {
  active: "모집중",
  upcoming: "예정",
  ended: "마감",
};

function ContestCard({ contest }: { contest: HackathonRow }) {
  const status = getHackathonStatus(contest);

  const formatDate = (d: string | null) => {
    if (!d) return "미정";
    return new Date(d).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <a
      href={contest.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-5 bg-white border border-gray-100 rounded-xl hover:border-orange-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        {contest.prize && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {contest.prize}
          </span>
        )}
      </div>

      <h3 className="font-bold text-[#18181B] group-hover:text-orange-600 transition-colors mb-1.5 leading-snug">
        {contest.title}
      </h3>

      {contest.description && (
        <p className="text-sm text-[#71717A] line-clamp-2 mb-3">{contest.description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
        <span>{contest.organizer ?? ""}</span>
        <span>{formatDate(contest.starts_at)} — {formatDate(contest.ends_at)}</span>
      </div>

      {contest.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {contest.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] text-[#A1A1AA] px-2 py-0.5 rounded bg-gray-50">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

async function ContestList({ filter }: { filter?: HackathonStatus }) {
  const contests = await getContests(filter);

  if (contests.length === 0) {
    return (
      <div className="text-center py-16 text-[#A1A1AA]">
        <p className="font-bold mb-1">공모전이 없습니다</p>
        <p className="text-sm">새로운 공모전이 등록되면 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contests.map((c) => (
        <ContestCard key={c.id} contest={c} />
      ))}
    </div>
  );
}

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "모집중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">공모전</h1>
        <p className="text-sm text-[#71717A]">
          창업 경진대회 · 아이디어 공모전 · 스타트업 대회 정보를 모아봅니다
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/contests?status=${tab.value}` : "/contests"}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              currentFilter === tab.value
                ? "bg-[#18181B] text-white"
                : "bg-gray-100 text-[#71717A] hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-gray-50 rounded-xl h-40" />
            ))}
          </div>
        }
      >
        <ContestList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
