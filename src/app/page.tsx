import { Suspense } from "react";
import Link from "next/link";
import { getHackathons, getContests, getDeadlineSoon, getStats, type HackathonRow } from "@/lib/data/hackathons";
import { EventCard } from "@/components/event-card";

export const revalidate = 300;

async function StatsBar() {
  const stats = await getStats();
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-center">
        <p className="text-2xl font-black text-emerald-600">{stats.hackathons}</p>
        <p className="text-[11px] text-[#A1A1AA] font-medium">진행중 해커톤</p>
      </div>
      <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-center">
        <p className="text-2xl font-black text-orange-600">{stats.contests}</p>
        <p className="text-[11px] text-[#A1A1AA] font-medium">모집중 공모전</p>
      </div>
    </div>
  );
}

async function DeadlineSoon() {
  const items = await getDeadlineSoon(7);
  if (items.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        마감 임박
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((h) => (
          <EventCard key={h.id} item={h} accent={h.category === "contest" ? "orange" : "teal"} />
        ))}
      </div>
    </section>
  );
}

async function FeaturedHackathons() {
  const hackathons = await getHackathons();
  const featured = hackathons.slice(0, 4);

  if (featured.length === 0) {
    return <p className="text-[#A1A1AA] text-sm py-8">수집된 해커톤이 없습니다</p>;
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
    return <p className="text-[#A1A1AA] text-sm py-8">수집된 공모전이 없습니다</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contests.map((c) => (
        <EventCard key={c.id} item={c} accent="orange" />
      ))}
    </div>
  );
}

async function PopularTags() {
  const hackathons = await getHackathons();
  const contests = await getContests();
  const all = [...hackathons, ...contests];

  const tagCounts = new Map<string, number>();
  for (const item of all) {
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const top = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  if (top.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] mb-3">인기 태그</h2>
      <div className="flex flex-wrap gap-2">
        {top.map(([tag, count]) => (
          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-100 text-[#52525B]">
            {tag} <span className="text-[#A1A1AA]">{count}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function Skeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-36" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-4xl px-6 pt-10 pb-16 pl-14 lg:pl-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">
          더노코즈
        </h1>
        <p className="text-sm text-[#71717A]">
          AI & 노코드 해커톤, 공모전을 한눈에. 팀도 모으고, 후기도 나누는 커뮤니티.
        </p>
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="flex gap-4 mb-8"><div className="flex-1 h-20 bg-gray-50 rounded-xl animate-pulse" /><div className="flex-1 h-20 bg-gray-50 rounded-xl animate-pulse" /></div>}>
        <StatsBar />
      </Suspense>

      {/* Deadline Soon */}
      <Suspense fallback={null}>
        <DeadlineSoon />
      </Suspense>

      {/* Hackathons */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
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

      {/* Contests */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            공모전
          </h2>
          <Link href="/contests" className="text-xs font-semibold text-[#A1A1AA] hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
        <Suspense fallback={<Skeleton count={2} />}>
          <FeaturedContests />
        </Suspense>
      </section>

      {/* Popular Tags */}
      <Suspense fallback={null}>
        <PopularTags />
      </Suspense>

      {/* About */}
      <section className="mt-12 p-5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-[#71717A] leading-relaxed">
        <span className="font-bold text-[#18181B]">더노코즈</span>는 AI · 노코드 · 데이터 분야의 해커톤과 공모전을 자동으로 모아주는 커뮤니티입니다.
        EventUs, Dacon 등 주요 플랫폼에서 매일 최신 정보를 수집합니다.
      </section>
    </div>
  );
}
