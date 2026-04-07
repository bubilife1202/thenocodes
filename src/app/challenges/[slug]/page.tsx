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
    <div className="p-6 md:p-10 max-w-4xl">
      {/* Challenge Header — Cafe Lounge Style */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
            isActive
              ? "bg-[#34D399]/10 text-[#0F766E] border border-[#34D399]/20"
              : "bg-gray-100 text-[#71717A]"
          }`}>
            {isActive ? "진행 중 🔥" : "마감 ☕️"}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#FB923C]/10 text-[#C2410C]">
            {CATEGORY_LABELS[challenge.category]}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 text-[#52525B]">
            {DIFFICULTY_LABELS[challenge.difficulty]}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#3F3F46] leading-tight mb-6">
          {challenge.title}
        </h1>
        
        <div className="cafe-card p-8 md:p-10 bg-white/80 border-[#34D399]/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/5 blur-3xl rounded-full" />
          <div className="prose prose-stone max-w-none relative z-10">
            <p className="text-[#52525B] text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {challenge.description}
            </p>
          </div>
          {challenge.ends_at ? (
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest">마감 기한</span>
              <span className="text-sm font-black text-[#71717A]">
                {new Date(challenge.ends_at).toLocaleDateString("ko-KR")} 까지
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Submission Form — only if active */}
      {isActive ? (
        <div className="mb-20">
          <h2 className="text-xl font-black text-[#3F3F46] mb-6 flex items-center gap-2">
            💡 당신의 아이디어를 나눠주세요
          </h2>
          <SubmissionForm challengeId={challenge.id} isLoggedIn={!!user} />
        </div>
      ) : null}

      {/* Submissions — Showcasing Synergy */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[#3F3F46] flex items-center gap-2">
            🎨 도착한 멋진 풀이들
          </h2>
          <div className="text-[10px] font-bold text-[#A1A1AA] tracking-widest uppercase">
            Community Showcase
          </div>
        </div>
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl h-48 shadow-sm" />
            <div className="bg-white border border-gray-100 rounded-3xl h-48 shadow-sm" />
          </div>
        }>
          <SubmissionList challengeId={challenge.id} />
        </Suspense>
      </section>
    </div>
  );
}
