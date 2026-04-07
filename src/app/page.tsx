import { Suspense } from "react";
import Link from "next/link";
import { getHackathons, getContests, type HackathonRow } from "@/lib/data/hackathons";
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

function formatDate(d: string | null) {
  if (!d) return "미정";
  return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function EventCard({ item, accent }: { item: HackathonRow; accent: "teal" | "orange" }) {
  const status = getHackathonStatus(item);
  const hoverColor = accent === "teal" ? "hover:border-emerald-200" : "hover:border-orange-200";
  const titleHover = accent === "teal" ? "group-hover:text-emerald-600" : "group-hover:text-orange-600";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-5 bg-white border border-gray-100 rounded-xl ${hoverColor} hover:shadow-sm transition-all`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        {item.prize && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {item.prize}
          </span>
        )}
      </div>
      <h3 className={`font-bold text-[#18181B] ${titleHover} transition-colors mb-1.5 leading-snug`}>
        {item.title}
      </h3>
      {item.description && (
        <p className="text-sm text-[#71717A] line-clamp-2 mb-3">{item.description}</p>
      )}
      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
        <span>{item.organizer ?? ""}</span>
        <span>{formatDate(item.starts_at)} — {formatDate(item.ends_at)}</span>
      </div>
    </a>
  );
}

async function FeaturedHackathons() {
  const hackathons = await getHackathons();
  const featured = hackathons.slice(0, 6);

  if (featured.length === 0) {
    return <p className="text-[#A1A1AA] text-sm">수집된 해커톤이 없습니다</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {featured.map((h) => (
        <EventCard key={h.id} item={h} accent="teal" />
      ))}
    </div>
  );
}

async function FeaturedContests() {
  const contests = await getContests();

  if (contests.length === 0) {
    return <p className="text-[#A1A1AA] text-sm">수집된 공모전이 없습니다</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contests.map((c) => (
        <EventCard key={c.id} item={c} accent="orange" />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="animate-pulse bg-gray-50 rounded-xl h-36" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <section className="pt-16 pb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
          해커톤 & 공모전
          <br />
          <span className="text-[#A1A1AA]">한눈에 모아보기</span>
        </h1>
        <p className="text-[#71717A] max-w-lg">
          한국에서 진행중인 AI 경진대회, 데이터 해커톤, 창업 공모전 정보를 매일 자동으로 수집합니다.
        </p>
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            해커톤
          </h2>
          <Link href="/hackathons" className="text-xs font-semibold text-[#A1A1AA] hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
        <Suspense fallback={<Skeleton />}>
          <FeaturedHackathons />
        </Suspense>
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            공모전
          </h2>
          <Link href="/contests" className="text-xs font-semibold text-[#A1A1AA] hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
        <Suspense fallback={<Skeleton />}>
          <FeaturedContests />
        </Suspense>
      </section>
    </div>
  );
}
