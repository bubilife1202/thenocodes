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
import type { SignalType } from "@/lib/signals/constants";

export const revalidate = 300;

const SIGNAL_TYPE_KO: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API",
  open_model: "오픈모델",
  policy: "정책",
};

async function HomeContent() {
  const [
    { hackathons, contests },
    meetups,
    signals,
    challenges,
    stats,
    challengeBoard,
    weeklyChallenge,
  ] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(4),
    getFeaturedSignals(4),
    getFeaturedChallenges(4),
    getStats(),
    getChallengeBoardPageData(),
    getCurrentWeeklyChallenge(),
  ]);
  const { item: dailyChallenge, recipe: dailyRecipe } = getDailyChallenge();
  const hasChallengeActivity =
    challengeBoard.totals.references +
      challengeBoard.totals.comments +
      challengeBoard.totals.experimentLogs >
    0;

  const sorted = sortHackathons([...hackathons, ...contests]);
  const opportunities = sorted.slice(0, 8);

  const now = new Date();
  const deadlineSoon = sorted.filter((item) => {
    if (!item.ends_at || getHackathonStatus(item, now) !== "active") return false;
    const daysLeft = Math.ceil(
      (new Date(item.ends_at).getTime() - now.getTime()) / 86400000
    );
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
  const activityItems = recentActivity.slice(0, 3);

  return (
    <div className="divide-y divide-[#ECE7DF]">

      {/* 헤더 */}
      <div className="pb-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-xl font-black tracking-tight text-[#18181B]">
            더노코즈<span className="text-[#0F766E]">.</span>
          </h1>
          <span className="text-sm text-[#A1A1AA]">
            해커톤 {stats.hackathons} · 공모전 {stats.contests} · 밋업 {stats.meetups}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#6B6760]">
          한국 AI 빌더용 해커톤·공모전·밋업 보드. 매일 업데이트.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/hackathons"
            className="rounded-lg bg-[#0F766E] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0B5F58]"
          >
            해커톤 보기
          </Link>
          <Link
            href="/challenges"
            className="rounded-lg border border-[#ECE7DF] px-3 py-1.5 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
          >
            실험 도구
          </Link>
          <a
            href="https://open.kakao.com/o/pSpn5mpi"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#ECE7DF] px-3 py-1.5 text-sm font-medium text-[#18181B] hover:bg-[#F8F5F0]"
          >
            오픈채팅
          </a>
        </div>
      </div>

      {/* 마감 임박 */}
      {deadlineSoon.length > 0 && (
        <div className="py-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-sm font-bold text-[#18181B]">마감 임박</h2>
            <Link
              href="/hackathons"
              className="ml-auto text-xs text-[#A1A1AA] hover:text-[#18181B]"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-[#F3F0EB]">
            {deadlineSoon.slice(0, 5).map((item) => {
              const daysLeft = item.ends_at
                ? Math.ceil(
                    (new Date(item.ends_at).getTime() - now.getTime()) / 86400000
                  )
                : null;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-mx-2 flex items-baseline gap-3 rounded px-2 py-2 hover:bg-[#FCFBF8]"
                >
                  <span
                    className={`w-10 shrink-0 text-[11px] font-semibold ${item.category === "contest" ? "text-[#C46A1A]" : "text-[#0F766E]"}`}
                  >
                    {item.category === "contest" ? "공모전" : "해커톤"}
                  </span>
                  <span className="flex-1 truncate text-sm text-[#18181B]">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-red-600">
                    {daysLeft === 0
                      ? "오늘 마감"
                      : daysLeft === 1
                        ? "내일 마감"
                        : `${formatShortDate(item.ends_at!)} 마감`}
                  </span>
                  {item.organizer && (
                    <span className="hidden shrink-0 text-xs text-[#A1A1AA] sm:block">
                      {item.organizer}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 해커톤 · 공모전 */}
      <div className="py-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-bold text-[#18181B]">해커톤 · 공모전</h2>
          <Link
            href="/hackathons"
            className="text-xs text-[#A1A1AA] hover:text-[#0F766E]"
          >
            해커톤 전체 →
          </Link>
          <Link
            href="/contests"
            className="text-xs text-[#A1A1AA] hover:text-[#C46A1A]"
          >
            공모전 전체 →
          </Link>
        </div>
        {opportunities.length > 0 ? (
          <div className="divide-y divide-[#F3F0EB]">
            {opportunities.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="-mx-2 flex items-baseline gap-3 rounded px-2 py-2 hover:bg-[#FCFBF8]"
              >
                <span
                  className={`w-10 shrink-0 text-[11px] font-semibold ${item.category === "contest" ? "text-[#C46A1A]" : "text-[#0F766E]"}`}
                >
                  {item.category === "contest" ? "공모전" : "해커톤"}
                </span>
                <span className="flex-1 truncate text-sm text-[#18181B]">
                  {item.title}
                </span>
                {item.ends_at && (
                  <span className="shrink-0 text-xs text-[#A1A1AA]">
                    {formatShortDate(item.ends_at)} 마감
                  </span>
                )}
                {item.organizer && (
                  <span className="hidden shrink-0 text-xs text-[#A1A1AA] sm:block">
                    {item.organizer}
                  </span>
                )}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A1A1AA]">
            등록된 항목이 없습니다. 매일 업데이트됩니다.
          </p>
        )}
      </div>

      {/* 서울 밋업 */}
      {meetups.length > 0 && (
        <div className="py-5">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#18181B]">서울 밋업</h2>
            <Link
              href="/meetups"
              className="text-xs text-[#A1A1AA] hover:text-[#0F766E]"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-[#F3F0EB]">
            {meetups.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="-mx-2 flex items-baseline gap-3 rounded px-2 py-2 hover:bg-[#FCFBF8]"
              >
                <span className="w-10 shrink-0 text-[11px] font-semibold text-[#0F766E]">
                  밋업
                </span>
                <span className="flex-1 truncate text-sm text-[#18181B]">
                  {item.title}
                </span>
                {item.starts_at && (
                  <span className="shrink-0 text-xs text-[#A1A1AA]">
                    {formatShortDate(item.starts_at)}
                  </span>
                )}
                {item.organizer && (
                  <span className="hidden shrink-0 text-xs text-[#A1A1AA] sm:block">
                    {item.organizer}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 흐름 */}
      {signals.length > 0 && (
        <div className="py-5">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#18181B]">흐름</h2>
            <Link
              href="/signals"
              className="text-xs text-[#A1A1AA] hover:text-[#0F766E]"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-[#F3F0EB]">
            {signals.map((item) => (
              <a
                key={item.id}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="-mx-2 flex items-baseline gap-3 rounded px-2 py-2 hover:bg-[#FCFBF8]"
              >
                <span className="w-14 shrink-0 text-[11px] font-semibold text-[#0F766E]">
                  {SIGNAL_TYPE_KO[item.signal_type]}
                </span>
                <span className="flex-1 truncate text-sm text-[#18181B]">
                  {item.title}
                </span>
                <span className="shrink-0 text-xs text-[#A1A1AA]">
                  {formatShortDate(item.published_at)}
                </span>
                {item.source_name && (
                  <span className="hidden shrink-0 text-xs text-[#A1A1AA] sm:block">
                    {item.source_name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 실험 도구 */}
      {challenges.length > 0 && (
        <div className="py-5">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold text-[#18181B]">실험 도구</h2>
            {hasChallengeActivity && (
              <span className="text-xs text-[#A1A1AA]">
                레퍼런스 {challengeBoard.totals.references} · 코멘트{" "}
                {challengeBoard.totals.comments} · 실험 로그{" "}
                {challengeBoard.totals.experimentLogs}
              </span>
            )}
            <Link
              href="/challenges"
              className="ml-auto text-xs text-[#A1A1AA] hover:text-[#0F766E]"
            >
              전체 보기 →
            </Link>
          </div>

          {/* 오늘의 레시피 */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-[#A1A1AA]">오늘의 2분 레시피</p>
              <p className="mt-0.5 text-sm font-medium text-[#18181B]">
                {dailyRecipe.scenario}
              </p>
              <p className="mt-0.5 text-xs text-[#6B6760]">
                {dailyChallenge.title} · {dailyRecipe.expectedTime}
              </p>
            </div>
            <a
              href={dailyChallenge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 shrink-0 rounded-lg bg-[#18181B] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#2A2A2A]"
            >
              {dailyChallenge.ctaLabel ?? "열기 →"}
            </a>
          </div>

          {/* 이번 주 챌린지 */}
          {weeklyChallenge && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-[#ECE7DF] px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0F766E]" />
                    이번 주 챌린지
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    참여 {weeklyChallenge.entries.length}명
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#18181B]">
                  {weeklyChallenge.challenge.title}
                </p>
                {weeklyChallenge.tool && (
                  <p className="mt-0.5 text-xs text-[#6B6760]">
                    {weeklyChallenge.tool.title}
                  </p>
                )}
              </div>
              <Link
                href="/challenges/weekly"
                className="ml-4 shrink-0 rounded-lg bg-[#0F766E] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#0B5F58]"
              >
                참여하기 →
              </Link>
            </div>
          )}

          {/* 최근 레퍼런스 */}
          {hasChallengeActivity && challengeBoard.recentReferences.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-[#A1A1AA]">
                최근 레퍼런스
              </p>
              <div className="divide-y divide-[#F3F0EB]">
                {challengeBoard.recentReferences.slice(0, 3).map((ref) => (
                  <Link
                    key={ref.id}
                    href={`/challenges/${ref.tool_id}`}
                    className="-mx-2 flex items-baseline gap-3 rounded px-2 py-2 hover:bg-[#FCFBF8]"
                  >
                    <span className="flex-1 truncate text-sm text-[#18181B]">
                      {ref.title}
                    </span>
                    <span className="shrink-0 text-xs text-[#A1A1AA]">
                      {ref.tool?.title ?? ref.tool_id}
                    </span>
                    <span className="hidden shrink-0 text-xs text-[#A1A1AA] sm:block">
                      {ref.submitted_name || "익명"} · {formatShortDate(ref.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 도구 카드 */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {challenges.map((item) => {
              const counts = getCommunityCountsForTool(
                challengeBoard.countsByTool,
                item.id
              );
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

          {/* 최근 활동 */}
          {activityItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#ECE7DF] pt-3">
              <span className="text-xs font-semibold text-[#A1A1AA]">최근 활동</span>
              {activityItems.map((a, i) => (
                <Link
                  key={i}
                  href={a.href}
                  className="text-xs text-[#6B6760] hover:text-[#18181B]"
                >
                  {a.label}{" "}
                  <span className="text-[#A1A1AA]">· {a.time}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
      <Suspense
        fallback={
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-7 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
