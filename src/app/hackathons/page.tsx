import { Suspense } from "react";
import Link from "next/link";
import { getHackathons, type HackathonRow } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";

const STATUS_COLORS: Record<HackathonStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  upcoming: "bg-blue-50 text-blue-700",
  ended: "bg-gray-50 text-gray-400",
};

const STATUS_LABELS: Record<HackathonStatus, string> = {
  active: "진행중",
  upcoming: "예정",
  ended: "종료",
};

function HackathonCard({ hackathon }: { hackathon: HackathonRow }) {
  const status = getHackathonStatus(hackathon);

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
      href={hackathon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-5 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        {hackathon.prize && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {hackathon.prize}
          </span>
        )}
      </div>

      <h3 className="font-bold text-[#18181B] group-hover:text-emerald-600 transition-colors mb-1.5 leading-snug">
        {hackathon.title}
      </h3>

      {hackathon.description && (
        <p className="text-sm text-[#71717A] line-clamp-2 mb-3">{hackathon.description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
        <span>{hackathon.organizer ?? ""}</span>
        <span>{formatDate(hackathon.starts_at)} — {formatDate(hackathon.ends_at)}</span>
      </div>

      {hackathon.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hackathon.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] text-[#A1A1AA] px-2 py-0.5 rounded bg-gray-50">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

async function HackathonList({ filter }: { filter?: HackathonStatus }) {
  const hackathons = await getHackathons(filter);

  if (hackathons.length === 0) {
    return (
      <div className="text-center py-16 text-[#A1A1AA]">
        <p className="font-bold mb-1">해커톤이 없습니다</p>
        <p className="text-sm">매일 자동으로 업데이트됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hackathons.map((h) => (
        <HackathonCard key={h.id} hackathon={h} />
      ))}
    </div>
  );
}

export default async function HackathonsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const currentFilter = (params.status as HackathonStatus) ?? undefined;

  const tabs: { label: string; value: HackathonStatus | undefined }[] = [
    { label: "전체", value: undefined },
    { label: "진행중", value: "active" },
    { label: "예정", value: "upcoming" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">해커톤</h1>
        <p className="text-sm text-[#71717A]">
          AI · 데이터 · 노코드 해커톤 공고를 매일 자동으로 수집합니다
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/hackathons?status=${tab.value}` : "/hackathons"}
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
        <HackathonList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
