import { Suspense } from "react";
import Link from "next/link";
import { getHomeData } from "@/lib/data/hackathons";
import { EventCard } from "@/components/event-card";

export const revalidate = 300;

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

async function HomeContent() {
  const { hackathons, contests, deadlineSoon, stats, popularTags, lastUpdated } = await getHomeData();

  return (
    <>
      {/* Stats + Freshness */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-center">
          <p className="text-2xl font-black text-emerald-600">{stats.hackathons}</p>
          <p className="text-xs text-[#71717A]">진행중 해커톤</p>
        </div>
        <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-center">
          <p className="text-2xl font-black text-orange-600">{stats.contests}</p>
          <p className="text-xs text-[#71717A]">모집중 공모전</p>
        </div>
        {lastUpdated && (
          <div className="flex-1 p-4 bg-white border border-gray-100 rounded-xl text-center">
            <p className="text-2xl font-black text-[#71717A]">{timeAgo(lastUpdated)}</p>
            <p className="text-xs text-[#71717A]">마지막 업데이트</p>
          </div>
        )}
      </div>

      {/* Deadline Soon */}
      {deadlineSoon.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2 mb-4">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            마감 임박
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {deadlineSoon.map((h) => (
              <EventCard key={h.id} item={h} accent={h.category === "contest" ? "orange" : "teal"} />
            ))}
          </div>
        </section>
      )}

      {/* Hackathons */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-500" />
            해커톤
          </h2>
          <Link href="/hackathons" prefetch={false} className="text-xs font-semibold text-[#71717A] hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
        {hackathons.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {hackathons.map((h) => (
              <EventCard key={h.id} item={h} accent="teal" />
            ))}
          </div>
        ) : (
          <p className="text-[#71717A] text-sm py-8">수집된 해커톤이 없습니다</p>
        )}
      </section>

      {/* Contests */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-2">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-orange-500" />
            공모전
          </h2>
          <Link href="/contests" prefetch={false} className="text-xs font-semibold text-[#71717A] hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
        {contests.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {contests.map((c) => (
              <EventCard key={c.id} item={c} accent="orange" />
            ))}
          </div>
        ) : (
          <p className="text-[#71717A] text-sm py-8">수집된 공모전이 없습니다</p>
        )}
      </section>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B] mb-3">인기 태그</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(([tag, count]) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-100 text-[#52525B]">
                {tag} <span className="text-[#71717A]">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section className="p-5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-[#71717A] leading-relaxed">
        <span className="font-bold text-[#18181B]">더노코즈</span>는 AI · 노코드 · 데이터 분야의 해커톤과 공모전을 자동으로 모아주는 커뮤니티입니다.
        EventUs, Dacon 등 주요 플랫폼에서 매일 최신 정보를 수집합니다.
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-4xl px-6 pt-10 pb-16 pl-14 lg:pl-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight mb-1">더노코즈</h1>
        <p className="text-sm text-[#71717A]">
          AI · 노코드 빌더들의 커뮤니티. 실시간 해커톤 · 공모전 데이터로 기회를 잡으세요.
        </p>
      </div>
      <Suspense fallback={
        <div className="space-y-8">
          <div className="flex gap-3">{[1,2,3].map(n => <div key={n} className="flex-1 h-20 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(n => <div key={n} className="h-36 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}
