import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals } from "@/lib/data/signals";
import { getFeaturedChallenges, getDailyChallenge } from "@/lib/data/challenges";
import { getChallengeBoardPageData, getCommunityCountsForTool, getCurrentWeeklyChallenge } from "@/lib/data/challenge-board";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { formatShortDate, relativeTime } from "@/lib/utils/date";
import { ChallengeCard } from "@/components/challenge-card";

export const revalidate = 300;

const SIGNAL_TYPE_LABELS: Record<string, string> = {
  platform_launch: "플랫폼",
  api_tool: "API/도구",
  open_model: "오픈모델",
  policy: "정책",
};

async function HomeContent() {
  const [{ hackathons, contests }, meetups, signals, challenges, stats, challengeBoard, weeklyChallenge] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(4),
    getFeaturedSignals(4),
    getFeaturedChallenges(4),
    getStats(),
    getChallengeBoardPageData(),
    getCurrentWeeklyChallenge(),
  ]);
  const { item: dailyChallenge, recipe: dailyRecipe } = getDailyChallenge();
  const hasChallengeActivity = challengeBoard.totals.references + challengeBoard.totals.comments + challengeBoard.totals.experimentLogs > 0;

  const sorted = sortHackathons([...hackathons, ...contests]);
  const opportunities = sorted.slice(0, 8);

  const now = new Date();
  const deadlineSoon = sorted.filter((item) => {
    if (!item.ends_at || getHackathonStatus(item, now) !== "active") return false;
    const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const recentActivity: Array<{ label: string; time: string; href: string }> = [];
  for (const log of challengeBoard.recentExperimentLogs.slice(0, 2)) {
    recentActivity.push({
      label: `${log.submitted_name || "익명"}이 ${log.tool?.title ?? log.tool_id} 실험`,
      time: relativeTime(log.created_at),
      href: `/challenges/${log.tool_id}`,
    });
  }
  for (const comment of challengeBoard.recentComments.slice(0, 2)) {
    recentActivity.push({
      label: `${comment.submitted_name || "익명"}이 ${comment.tool?.title ?? comment.tool_id} 코멘트`,
      time: relativeTime(comment.created_at),
      href: `/challenges/${comment.tool_id}`,
    });
  }

  function daysLeft(endsAt: string) {
    const d = Math.ceil((new Date(endsAt).getTime() - now.getTime()) / 86400000);
    if (d <= 0) return "오늘 마감";
    if (d === 1) return "내일 마감";
    return `${d}일 남음`;
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B]">
            더노코즈<span className="text-[#0F766E]">.</span>
          </h1>
          <p className="mt-1 text-sm text-[#6B6760]">한국 AI 빌더를 위한 실전 보드</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xl font-black text-[#0F766E]">{stats.hackathons}</p>
              <p className="text-[11px] text-[#6B6760]">해커톤</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#C46A1A]">{stats.contests}</p>
              <p className="text-[11px] text-[#6B6760]">공모전</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#7C3AED]">{stats.meetups}</p>
              <p className="text-[11px] text-[#6B6760]">밋업</p>
            </div>
          </div>
          <a
            href="https://open.kakao.com/o/pSpn5mpi"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B5F58]"
          >
            오픈채팅
          </a>
        </div>
      </header>

      {/* 최근 활동 */}
      {recentActivity.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#ECE7DF] pb-3 text-sm text-[#6B6760]">
          <span className="text-[11px] font-bold text-[#A1A1AA]">최근</span>
          {recentActivity.slice(0, 3).map((a, i) => (
            <Link key={i} href={a.href} className="hover:text-[#18181B]">
              {a.label} <span className="text-[#A1A1AA]">· {a.time}</span>
            </Link>
          ))}
        </div>
      )}

      {/* 마감 임박 */}
      {deadlineSoon.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-base font-black text-[#18181B]">마감 임박</h2>
            <Link href="/hackathons" className="ml-auto text-sm text-[#991B1B] hover:underline">전체 보기</Link>
          </div>
          <div className="divide-y divide-[#F0EBE3] rounded-xl border border-[#ECE7DF] bg-white">
            {deadlineSoon.slice(0, 5).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${item.category === "contest" ? "bg-[#FFF7EF] text-[#C46A1A]" : "bg-[#F3FBF9] text-[#0F766E]"}`}>
                  {item.category === "contest" ? "공모전" : "해커톤"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#18181B]">{item.title}</span>
                <span className="shrink-0 text-[12px] font-semibold text-[#B91C1C]">{item.ends_at ? daysLeft(item.ends_at) : ""}</span>
                <span className="hidden shrink-0 text-[11px] text-[#A1A1AA] sm:block">{item.organizer}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 해커톤 · 공모전 */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-base font-black text-[#18181B]">해커톤 · 공모전</h2>
          <div className="ml-auto flex gap-2">
            <Link href="/hackathons" className="text-sm text-[#0F766E] hover:underline">해커톤</Link>
            <Link href="/contests" className="text-sm text-[#C46A1A] hover:underline">공모전</Link>
          </div>
        </div>
        {opportunities.length > 0 ? (
          <div className="divide-y divide-[#F0EBE3] rounded-xl border border-[#ECE7DF] bg-white">
            {opportunities.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${item.category === "contest" ? "bg-[#FFF7EF] text-[#C46A1A]" : item.category === "meetup" ? "bg-[#F5F3FF] text-[#7C3AED]" : "bg-[#F3FBF9] text-[#0F766E]"}`}>
                  {item.category === "contest" ? "공모전" : item.category === "meetup" ? "밋업" : "해커톤"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#18181B]">{item.title}</span>
                <span className="shrink-0 text-[12px] text-[#6B6760]">{item.ends_at ? formatShortDate(item.ends_at) : ""}</span>
                <span className="hidden shrink-0 text-[11px] text-[#A1A1AA] sm:block">{item.organizer}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-[#A1A1AA]">등록된 항목이 없습니다.</p>
        )}
      </section>

      {/* 밋업 */}
      {meetups.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-base font-black text-[#18181B]">서울 밋업</h2>
            <Link href="/meetups" className="ml-auto text-sm text-[#0F766E] hover:underline">전체 보기</Link>
          </div>
          <div className="divide-y divide-[#F0EBE3] rounded-xl border border-[#ECE7DF] bg-white">
            {meetups.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
              >
                <span className="shrink-0 rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED]">밋업</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#18181B]">{item.title}</span>
                <span className="shrink-0 text-[12px] text-[#6B6760]">{item.ends_at ? formatShortDate(item.ends_at) : ""}</span>
                <span className="hidden shrink-0 text-[11px] text-[#A1A1AA] sm:block">{item.location}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 흐름 */}
      {signals.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-base font-black text-[#18181B]">흐름</h2>
            <Link href="/signals" className="ml-auto text-sm text-[#7C3AED] hover:underline">전체 보기</Link>
          </div>
          <div className="divide-y divide-[#F0EBE3] rounded-xl border border-[#ECE7DF] bg-white">
            {signals.map((item) => (
              <Link
                key={item.id}
                href={`/signals`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FAFAF8]"
              >
                <span className="shrink-0 rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                  {SIGNAL_TYPE_LABELS[item.signal_type] ?? item.signal_type}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-[#18181B]">{item.title}</span>
                <span className="shrink-0 text-[12px] text-[#6B6760]">{formatShortDate(item.published_at)}</span>
                <span className="hidden shrink-0 text-[11px] text-[#A1A1AA] sm:block">{item.source_name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 실험 도구 */}
      {challenges.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-base font-black text-[#18181B]">실험 도구</h2>
            {hasChallengeActivity && (
              <span className="text-[11px] text-[#A1A1AA]">
                실험 {challengeBoard.totals.experimentLogs} · 레퍼런스 {challengeBoard.totals.references} · 코멘트 {challengeBoard.totals.comments}
              </span>
            )}
            <Link href="/challenges" className="ml-auto text-sm text-[#18181B] hover:underline">전체 보기</Link>
          </div>

          {weeklyChallenge && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-[#DDD6FE] bg-[#FAFAFF] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#7C3AED]" />
                <span className="text-sm font-semibold text-[#18181B]">{weeklyChallenge.challenge.title}</span>
                <span className="text-[11px] text-[#7C3AED]">참여 {weeklyChallenge.entries.length}명</span>
              </div>
              <Link href="/challenges/weekly" className="text-sm font-semibold text-[#7C3AED] hover:underline">참여하기</Link>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3">
            <div>
              <p className="text-[11px] font-bold text-[#A1A1AA]">오늘의 레시피</p>
              <p className="mt-0.5 text-sm text-[#18181B]">{dailyRecipe.scenario} <span className="text-[#6B6760]">· {dailyChallenge.title} · {dailyRecipe.expectedTime}</span></p>
            </div>
            <a href={dailyChallenge.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#0F766E] hover:underline">
              써보기
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {challenges.map((item) => {
              const counts = getCommunityCountsForTool(challengeBoard.countsByTool, item.id);
              return (
                <ChallengeCard
                  key={item.id}
                  item={item}
                  referenceCount={counts.referenceCount}
                  commentCount={counts.commentCount}
                  experimentLogCount={counts.experimentLogCount}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-20 animate-pulse rounded-xl bg-gray-50" />
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
