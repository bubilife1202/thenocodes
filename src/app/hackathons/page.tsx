import { Suspense } from "react";
import { getHackathons } from "@/lib/data/hackathons";
import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import type { HackathonRow } from "@/lib/data/hackathons";
import Link from "next/link";

const SOURCE_LABELS: Record<string, string> = {
  devpost: "Devpost",
  kaggle: "Kaggle",
  dacon: "Dacon",
  lablab: "Lablab.ai",
  hackerearth: "HackerEarth",
  eventus: "EventUs",
};

const STATUS_STYLES: Record<HackathonStatus, string> = {
  active: "bg-[#14B8A6]/10 text-[#0F766E]",
  upcoming: "bg-[#3B82F6]/10 text-[#1D4ED8]",
  ended: "bg-gray-100 text-[#A1A1AA]",
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
      className="group block p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#14B8A6]/20 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-50 text-[#71717A]">
          {SOURCE_LABELS[hackathon.source] ?? hackathon.source}
        </span>
        {hackathon.prize && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FDE047]/20 text-[#A16207]">
            {hackathon.prize}
          </span>
        )}
      </div>

      <h3 className="text-lg font-black text-[#18181B] group-hover:text-[#14B8A6] transition-colors mb-2 leading-tight">
        {hackathon.title}
      </h3>

      {hackathon.description && (
        <p className="text-sm text-[#71717A] line-clamp-2 mb-4 leading-relaxed">
          {hackathon.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
        <div className="flex flex-col gap-1">
          {hackathon.organizer && (
            <span className="text-[11px] font-bold text-[#52525B]">
              {hackathon.organizer}
            </span>
          )}
          <span className="text-[11px] text-[#A1A1AA]">
            {formatDate(hackathon.starts_at)} — {formatDate(hackathon.ends_at)}
          </span>
        </div>
        <span className="text-[10px] font-black text-[#14B8A6] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-all">
          자세히 보기 →
        </span>
      </div>

      {hackathon.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {hackathon.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-[#71717A] px-2 py-0.5 rounded-md bg-gray-50">
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
        <p className="text-lg font-bold mb-2">아직 수집된 해커톤이 없습니다</p>
        <p className="text-sm">매일 자동으로 업데이트됩니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
    { label: "종료", value: "ended" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1200px]">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-[#18181B] tracking-tight mb-2">
          Hackathons
        </h1>
        <p className="text-sm text-[#71717A] font-medium">
          AI · 데이터 · 노코드 해커톤 공고를 매일 자동으로 수집합니다
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/hackathons?status=${tab.value}` : "/hackathons"}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
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
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-gray-50 border border-gray-100 rounded-2xl h-48" />
            ))}
          </div>
        }
      >
        <HackathonList filter={currentFilter} />
      </Suspense>
    </div>
  );
}
