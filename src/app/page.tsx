import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { ActiveChallenges } from "@/components/home/active-challenges";
import { TopUsers } from "@/components/home/top-users";
import { LatestPosts } from "@/components/home/latest-posts";
import { LiveFeed } from "@/components/home/live-feed";
import { QuickShare } from "@/components/home/quick-share";
import { getDictionary } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/data/users";

function StreamSkeleton() {
  return <div className="animate-pulse bg-black/[0.02] border border-black/[0.05] rounded-xl h-64 w-full" />;
}

export default async function HomePage() {
  const [dict, user] = await Promise.all([
    getDictionary("ko"),
    getCurrentUser(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. 배너 */}
      <Hero />

      {/* 2. 메인 스트림 */}
      <div className="p-6 md:p-10 max-w-[1200px]">
        
        {/* 퀵 쉐어 바 (인사이트 공유) */}
        <QuickShare isLoggedIn={!!user} />

        <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1fr_300px]">
          
          {/* 왼쪽 피드 */}
          <div className="flex flex-col gap-16">
            
            {/* 진행 중인 챌린지 */}
            <section>
              <div className="flex items-center justify-between mb-8 pb-2 border-b border-black/[0.03]">
                <h2 className="text-[13px] font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                  {dict.home.active_challenges}
                  <span className="w-1 h-1 rounded-full bg-[#14B8A6]" />
                </h2>
              </div>
              <Suspense fallback={<StreamSkeleton />}>
                <ActiveChallenges />
              </Suspense>
            </section>

            {/* 최신 인사이트 & 큐레이션 */}
            <section>
              <div className="flex items-center justify-between mb-8 pb-2 border-b border-black/[0.03]">
                <h2 className="text-[13px] font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                  {dict.home.latest_insights}
                  <span className="w-1 h-1 rounded-full bg-[#FB923C]" />
                </h2>
              </div>
              <Suspense fallback={<StreamSkeleton />}>
                <LatestPosts />
              </Suspense>
            </section>

          </div>

          {/* 오른쪽 사이드바 정보 */}
          <aside className="flex flex-col gap-12">
            
            <section>
              <h3 className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-6">
                {dict.home.live_feed}
              </h3>
              <Suspense fallback={<div className="h-40 bg-gray-50 rounded-xl animate-pulse" />}>
                <LiveFeed />
              </Suspense>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-6">
                {dict.home.leaderboard}
              </h3>
              <Suspense fallback={<div className="h-40 bg-gray-50 rounded-xl animate-pulse" />}>
                <TopUsers />
              </Suspense>
            </section>

          </aside>

        </div>
      </div>
    </div>
  );
}
