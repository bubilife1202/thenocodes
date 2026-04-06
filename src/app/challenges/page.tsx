import { Suspense } from "react";
import Link from "next/link";
import { getAllChallenges } from "@/lib/data/challenges";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { ChallengeFilters } from "@/components/challenges/challenge-filters";

export const metadata = {
  title: "챌린지 - The Nocodes",
  description: "AI 활용 실무 챌린지에 참여하세요",
};

async function ChallengeList({ status }: { status?: string }) {
  const challenges = await getAllChallenges(status);

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        해당 조건의 챌린지가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">챌린지</h1>
          <p className="text-gray-400 mt-1">AI 시대의 실무 문제를 풀어보세요</p>
        </div>
        <Link
          href="/challenges/propose"
          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
        >
          문제 제안하기
        </Link>
      </div>

      <Suspense fallback={null}>
        <ChallengeFilters />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<div className="animate-pulse bg-gray-800/50 rounded-xl h-96" />}>
          <ChallengeList status={status} />
        </Suspense>
      </div>
    </div>
  );
}
