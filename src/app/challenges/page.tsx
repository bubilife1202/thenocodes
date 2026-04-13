import Link from "next/link";
import { ChallengeCard } from "@/components/challenge-card";
import { ActivityFeed, buildActivityFeed } from "@/components/activity-feed";
import { getChallenges, getDailyChallenge, type ChallengeKind } from "@/lib/data/challenges";
import {
  getChallengeBoardPageData,
  getCommunityCountsForTool,
  getMostActiveTools,
  getCurrentWeeklyChallenge,
  getTopContributors,
} from "@/lib/data/challenge-board";

export const revalidate = 300;

const tabs: { label: string; value?: ChallengeKind }[] = [
  { label: "전체" },
  { label: "프로토타입", value: "prototype" },
  { label: "문서", value: "docs" },
  { label: "비주얼", value: "visual" },
  { label: "오디오", value: "audio" },
];

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const currentKind = (params.kind as ChallengeKind | undefined) ?? undefined;
  const items = getChallenges(currentKind);
  const { item: dailyPick, recipe: dailyRecipe } = getDailyChallenge();
  const board = await getChallengeBoardPageData();
  const activeTools = getMostActiveTools(board.countsByTool, 3);
  const weeklyChallenge = await getCurrentWeeklyChallenge();
  const topContributors = getTopContributors(board.references, board.comments, board.experimentLogs, 5);
  const hasCommunityActivity = board.totals.references + board.totals.comments + board.totals.experimentLogs > 0;
  const activityFeedItems = buildActivityFeed(board.recentReferences, board.recentComments, board.recentExperimentLogs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="mb-2 text-2xl font-black tracking-tight">실험 도구</h1>
        <p className="text-sm leading-relaxed text-[#71717A]">
          회사에서 바로 써먹을 만한 AI 도구를 골라두고, 실제 레퍼런스와 짧은 후기를 붙여가는 업무형 보드.
        </p>
      </div>

      <div className="mb-8 rounded-[30px] border border-[#E9E2D8] bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#FFF8F1_100%)] p-5 shadow-[0_16px_36px_-32px_rgba(24,24,27,0.18)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">오늘의 2분 레시피</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#18181B]">{dailyRecipe.scenario}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5F5951]">{dailyPick.title}로 지금 바로 써볼 만한 업무 시나리오.</p>
            <div className="mt-3 space-y-2 rounded-[20px] bg-white/80 px-4 py-4 text-sm leading-relaxed text-[#6B6760]">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">추천 프롬프트</p>
              <p className="text-[15px] font-semibold leading-relaxed text-[#18181B]">{dailyRecipe.prompt}</p>
              <p>예상 시간 {dailyRecipe.expectedTime}, 결과물 {dailyRecipe.resultHint}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            <span className="inline-flex w-fit rounded-full bg-[#FFF2E4] px-3 py-1 text-[11px] font-semibold text-[#B45309]">
              {dailyPick.friction}
            </span>
            <a
              href={dailyPick.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
            >
              {dailyPick.ctaLabel ?? "지금 눌러보기 →"}
            </a>
            <p className="text-xs text-[#938B81]">홈페이지 링크보다, 바로 써먹을 상황과 프롬프트를 먼저 보여준다.</p>
          </div>
        </div>
      </div>

      {weeklyChallenge && (
        <div className="mb-8 rounded-[30px] border border-[#E6DDFB] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] p-5 shadow-[0_16px_36px_-32px_rgba(124,58,237,0.22)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#7C3AED]" />
                  이번 주 챌린지
                </span>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">
                  참여 {weeklyChallenge.entries.length}명
                </span>
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-[#18181B]">{weeklyChallenge.challenge.title}</h2>
              <p className="mt-1 text-sm text-[#5B21B6]">{weeklyChallenge.tool?.title}로 실험해보세요.</p>
            </div>
            <Link
              href="/challenges/weekly"
              className="inline-flex items-center justify-center rounded-2xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
            >
              참여하기 →
            </Link>
          </div>
        </div>
      )}

      {hasCommunityActivity ? (
        <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="rounded-[20px] bg-[#F8F5F0] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">전체 레퍼런스</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#18181B]">{board.totals.references}</p>
              </div>
              <div className="rounded-[20px] bg-[#F8F5F0] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">전체 코멘트</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#18181B]">{board.totals.comments}</p>
              </div>
              <div className="rounded-[20px] bg-[#F8F5F0] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">전체 실험 로그</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#18181B]">{board.totals.experimentLogs}</p>
              </div>
              <div className="rounded-[20px] bg-[#F8F5F0] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">최근 7일 활동</p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#18181B]">{board.totals.weeklyActivity}</p>
              </div>
            </div>

            <h2 className="text-lg font-black tracking-tight text-[#18181B]">최근 활동</h2>
            <div className="mt-4">
              <ActivityFeed items={activityFeedItems} limit={8} />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <h2 className="text-lg font-black tracking-tight text-[#18181B]">활동이 붙는 도구</h2>
            <div className="mt-4 space-y-3">
              {activeTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/challenges/${tool.id}`}
                  className="flex items-center justify-between rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-4 transition-colors hover:bg-[#F8F5F0]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#18181B]">{tool.title}</p>
                    <p className="mt-1 text-[12px] text-[#71717A]">{tool.useCase}</p>
                  </div>
                  <div className="text-right text-[11px] text-[#938B81]">
                    <p>레퍼런스 {tool.referenceCount}</p>
                    <p>코멘트 {tool.commentCount}</p>
                    {tool.experimentLogCount > 0 && <p>실험 {tool.experimentLogCount}</p>}
                  </div>
                </Link>
              ))}
            </div>

            {topContributors.length >= 3 && (
              <div className="mt-6 border-t border-[#F0EBE3] pt-6">
                <h3 className="text-sm font-black tracking-tight text-[#18181B]">활발한 빌더</h3>
                <div className="mt-3 space-y-2">
                  {topContributors.slice(0, 5).map((contributor) => (
                    <Link
                      key={contributor.name}
                      href={`/challenges/builders/${encodeURIComponent(contributor.name)}`}
                      className="flex items-center justify-between rounded-[18px] border border-[#ECE7DF] bg-[#FCFBF8] px-3 py-3 transition-colors hover:bg-[#F8F5F0]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#18181B]">{contributor.name}</p>
                        <p className="text-[11px] text-[#938B81]">{contributor.topToolTitle} 외</p>
                      </div>
                      <span className="text-[11px] text-[#938B81]">활동 {contributor.count}건</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">Community Layer</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-[#18181B]">레퍼런스 보드는 지금 채우는 중</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#71717A]">
            빈 숫자를 먼저 보여주지 않고, 실제로 참고할 링크와 짧은 후기부터 쌓이게 만들고 있습니다. 마음에 드는 도구가 있으면 상세 보드에서 바로 레퍼런스를 남길 수 있어요.
          </p>
        </section>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/challenges?kind=${tab.value}` : "/challenges"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              currentKind === tab.value
                ? "bg-[#18181B] text-white"
                : "bg-[#F4F4F5] text-[#71717A] hover:bg-[#E7E5E4]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-8 text-center text-[#A1A1AA]">
          <p className="mb-1 font-bold">아직 등록된 도구가 없습니다</p>
          <p className="text-sm">다른 유형을 선택해보세요.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const counts = getCommunityCountsForTool(board.countsByTool, item.id);
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
      )}
    </div>
  );
}
