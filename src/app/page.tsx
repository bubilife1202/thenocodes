import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { ActiveChallenges } from "@/components/home/active-challenges";
import { TopUsers } from "@/components/home/top-users";
import { LatestPosts } from "@/components/home/latest-posts";

function SectionSkeleton() {
  return <div className="animate-pulse bg-gray-800/50 rounded-xl h-48" />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 pb-24 space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">진행 중인 챌린지</h2>
          <Suspense fallback={<SectionSkeleton />}>
            <ActiveChallenges />
          </Suspense>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">TOP 리더보드</h2>
            <Suspense fallback={<SectionSkeleton />}>
              <TopUsers />
            </Suspense>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-4">최신 콘텐츠</h2>
            <Suspense fallback={<SectionSkeleton />}>
              <LatestPosts />
            </Suspense>
          </section>
        </div>
      </div>
    </>
  );
}
