import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getChallengeBySlug } from "@/lib/data/challenges";
import { getCurrentUser } from "@/lib/data/users";
import { SubmissionForm } from "@/components/challenges/submission-form";
import { SubmissionList } from "@/components/challenges/submission-list";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/types";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [challenge, user] = await Promise.all([
    getChallengeBySlug(slug),
    getCurrentUser(),
  ]);

  if (!challenge) notFound();

  const isActive = challenge.status === "active";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Challenge Header — renders immediately */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
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
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{challenge.title}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap">{challenge.description}</p>
        </div>
        {challenge.ends_at ? (
          <p className="text-sm text-gray-500 mt-4">
            마감: {new Date(challenge.ends_at).toLocaleDateString("ko-KR")}
          </p>
        ) : null}
      </div>

      {/* Submission Form — only if active */}
      {isActive ? (
        <div className="mb-12">
          <SubmissionForm challengeId={challenge.id} isLoggedIn={!!user} />
        </div>
      ) : null}

      {/* Submissions — streams via Suspense */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">제출된 풀이</h2>
        <Suspense fallback={<div className="animate-pulse bg-gray-800/50 rounded-xl h-48" />}>
          <SubmissionList challengeId={challenge.id} />
        </Suspense>
      </section>
    </div>
  );
}
