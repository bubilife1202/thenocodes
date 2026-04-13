import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals } from "@/lib/data/signals";
import { getFeaturedChallenges, getDailyChallenge } from "@/lib/data/challenges";
import { getChallengeBoardPageData, getCommunityCountsForTool, getCurrentWeeklyChallenge } from "@/lib/data/challenge-board";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";
import { EventCard } from "@/components/event-card";
import { SignalCard } from "@/components/signal-card";
import { ChallengeCard } from "@/components/challenge-card";

export const revalidate = 300;

async function HomeContent() {
  const [{ hackathons, contests }, meetups, signals, challenges, stats, challengeBoard, weeklyChallenge] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(2),
    getFeaturedSignals(2),
    getFeaturedChallenges(4),
    getStats(),
    getChallengeBoardPageData(),
    getCurrentWeeklyChallenge(),
  ]);
  const { item: dailyChallenge, recipe: dailyRecipe } = getDailyChallenge();
  const hasChallengeActivity = challengeBoard.totals.references + challengeBoard.totals.comments + challengeBoard.totals.experimentLogs > 0;

  const sorted = sortHackathons([...hackathons, ...contests]);
  const firstContest = sorted.find((item) => item.category === "contest");
  const withoutFirstContest = firstContest ? sorted.filter((item) => item !== firstContest) : sorted;
  const opportunities = firstContest
    ? [...withoutFirstContest.slice(0, 5), firstContest].sort((a, b) => sorted.indexOf(a) - sorted.indexOf(b))
    : sorted.slice(0, 6);

  const now = new Date();
  const deadlineSoon = sorted.filter((item) => {
    if (!item.ends_at || getHackathonStatus(item, now) !== "active") return false;
    const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  const statCards = [
    {
      label: "진행중 해커톤",
      value: stats.hackathons,
      accent: "bg-[#14B8A6]",
      shell: "border-[#D9EFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F4FBF9_100%)]",
      valueTone: "text-[#0F766E]",
    },
    {
      label: "모집중 공모전",
      value: stats.contests,
      accent: "bg-[#F59E0B]",
      shell: "border-[#F3DDC3] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF8F0_100%)]",
      valueTone: "text-[#C46A1A]",
    },
    {
      label: "밋업 / 세미나",
      value: stats.meetups,
      accent: "bg-[#6366F1]",
      shell: "border-[#DDD6FE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7F6FF_100%)]",
      valueTone: "text-[#4F46E5]",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[28px] border border-[#ECE7DF] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8F5F0_100%)] p-6 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.25)] sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Today Board</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#18181B] sm:text-[30px]">
            지금 보면 좋은 판만 앞으로 뺐습니다.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6B6760] sm:text-[15px]">
            더노코즈는 한국 AI 해커톤, 공모전, 밋업을 매일 추적합니다. 숫자는 현황이고, 아래 섹션은
            둘러보기 쉽게 다시 정리한 보드입니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[24px] border p-5 shadow-[0_14px_34px_-32px_rgba(24,24,27,0.2)] ${stat.shell}`}
            >
              <span className={`mb-4 block h-1.5 w-12 rounded-full ${stat.accent}`} />
              <p className={`text-[32px] font-black leading-none tracking-tight ${stat.valueTone}`}>{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-[#4B5563]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {deadlineSoon.length > 0 && (
        <section className="scroll-mt-24 rounded-[32px] border border-[#F3D6D6] bg-[linear-gradient(180deg,#FFF9F8_0%,#FFF1F1_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(239,68,68,0.3)] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
            <div className="xl:sticky xl:top-24">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F5CACA] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B91C1C]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Deadline Soon
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#18181B]">마감 임박</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#7F1D1D]">
                이번 주 안에 닫히는 항목만 먼저 모아뒀습니다. 급한 것부터 가볍게 체크하면 됩니다.
              </p>
              <Link
                href="/hackathons"
                className="mt-4 inline-flex items-center rounded-full border border-[#F5CACA] bg-white px-4 py-2 text-sm font-semibold text-[#991B1B] transition-colors hover:bg-[#FFF7F7]"
              >
                전체 일정 보기
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {deadlineSoon.slice(0, 4).map((item, index) => (
                <EventCard
                  key={item.id}
                  item={item}
                  accent={item.category === "contest" ? "orange" : "teal"}
                  variant={index === 0 ? "featured" : "default"}
                  className={index === 0 ? "md:col-span-2" : ""}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="scroll-mt-24">
        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Main Board</p>
            <h2 className="text-xl font-black tracking-tight text-[#18181B]">해커톤 · 공모전</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#71717A]">
              홈의 중심 축입니다. 가장 먼저 지원할 것, 비교할 것, 저장할 것이 여기 있어야 합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/hackathons"
              className="rounded-full border border-[#D9EFEA] bg-[#F3FBF9] px-4 py-2 text-sm font-semibold text-[#0F766E] hover:bg-[#E8F7F3]"
            >
              해커톤 전체
            </Link>
            <Link
              href="/contests"
              className="rounded-full border border-[#F3DDC3] bg-[#FFF7EF] px-4 py-2 text-sm font-semibold text-[#C46A1A] hover:bg-[#FDF1E4]"
            >
              공모전 전체
            </Link>
          </div>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {opportunities.map((item, index) => (
              <EventCard
                key={`${item.id}-${index}`}
                item={item}
                accent={item.category === "contest" ? "orange" : "teal"}
                variant={index === 0 ? "featured" : index >= 3 ? "compact" : "default"}
                className={index === 0 ? "lg:col-span-2" : ""}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ECE7DF] bg-white p-8 text-sm text-[#71717A]">
            등록된 해커톤/공모전이 없습니다. 매일 자동으로 업데이트됩니다.
          </div>
        )}
      </section>

      {meetups.length > 0 && (
        <section className="scroll-mt-24 rounded-[32px] border border-[#D9EFEA] bg-[linear-gradient(180deg,#F8FCFB_0%,#EEF8F6_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(15,118,110,0.28)] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <div>
              <div className="inline-flex rounded-full border border-[#BFE2DB] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F766E]">
                Seoul Offline
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#18181B]">서울 AI 밋업</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#115E59]">
                온라인 공고만 밀어넣으면 홈이 죽습니다. 실제로 가서 사람 만나는 판을 메인 중단으로
                올렸습니다.
              </p>
              <div className="mt-5 rounded-[24px] border border-white/80 bg-white/75 p-4">
                <p className="text-sm font-bold text-[#123B38]">오프라인 섹션의 역할</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5C7D78]">
                  지원할 이벤트와 달리, 밋업은 결심보다 동선이 중요합니다. 그래서 카드보다 섹션 톤을 먼저
                  분리했습니다.
                </p>
              </div>
              <Link
                href="/meetups"
                className="mt-4 inline-flex items-center rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
              >
                전체 밋업 보기
              </Link>
            </div>

            <div className="grid gap-4">
              {meetups.map((item, index) => (
                <EventCard
                  key={item.id}
                  item={item}
                  accent="teal"
                  showTags
                  variant={index === 0 ? "featured" : "default"}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {signals.length > 0 && (
        <section className="scroll-mt-24 rounded-[32px] border border-[#E6DDFB] bg-[linear-gradient(180deg,#FCFBFF_0%,#F5F1FF_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(124,58,237,0.28)] sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div>
              <div className="inline-flex rounded-full border border-[#DDD6FE] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                Signal Watch
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#18181B]">흐름</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5B21B6]">
                여긴 뉴스 모음이 아니라 변화를 해석하는 구역입니다. 행동 카드처럼 보이면 실패입니다.
              </p>
              <div className="mt-5 rounded-[24px] border border-white/80 bg-white/75 p-4">
                <p className="text-sm font-bold text-[#4C1D95]">이 섹션에서 봐야 할 것</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6D28D9]">
                  플랫폼 출시, API 변동, 오픈 모델, 정책 이슈를 한 카드 리듬으로 섞지 않고 톤별로
                  구분합니다.
                </p>
              </div>
              <Link
                href="/signals"
                className="mt-4 inline-flex items-center rounded-full border border-[#D8CCFB] bg-white px-4 py-2 text-sm font-semibold text-[#6D28D9] transition-colors hover:bg-[#FAF7FF]"
              >
                전체 흐름 보기
              </Link>
            </div>

            <div className="grid gap-4">
              {signals.map((item) => (
                <SignalCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {challenges.length > 0 && (
        <section className="scroll-mt-24 rounded-[30px] border border-[#ECE7DF] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7F2_100%)] p-5 shadow-[0_18px_40px_-34px_rgba(24,24,27,0.18)] sm:p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">Tool Shelf</p>
              <h2 className="text-xl font-black tracking-tight text-[#18181B]">실험 도구</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#71717A]">
                업무 중 잠깐 테스트해볼 만한 생성형 도구들을 모아뒀다. 시안, 샘플, 내부 초안에 빠르게 쓰기 좋다.
              </p>
            </div>
            <Link
              href="/challenges"
              className="rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#18181B] hover:bg-[#F8F5F0]"
            >
              더 보러가기
            </Link>
          </div>

          {hasChallengeActivity && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6760]">
                레퍼런스 {challengeBoard.totals.references}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6760]">
                코멘트 {challengeBoard.totals.comments}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6760]">
                실험 로그 {challengeBoard.totals.experimentLogs}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#6B6760]">
                최근 7일 활동 {challengeBoard.totals.weeklyActivity}
              </span>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#E9E2D8] bg-white/85 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">오늘의 2분 레시피</p>
              <p className="mt-1 text-sm font-semibold text-[#18181B]">{dailyRecipe.scenario}</p>
              <p className="mt-1 text-sm text-[#6B6760]">{dailyChallenge.title} · {dailyRecipe.expectedTime} · {dailyRecipe.resultHint}</p>
            </div>
            <a
              href={dailyChallenge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#18181B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
            >
              {dailyChallenge.ctaLabel ?? "도구 열기 →"}
            </a>
          </div>

          {weeklyChallenge && (
            <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-[#E6DDFB] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7C3AED]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7C3AED]" />
                    이번 주 챌린지
                  </span>
                  <span className="text-[11px] text-[#938B81]">참여 {weeklyChallenge.entries.length}명</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#18181B]">{weeklyChallenge.challenge.title}</p>
                <p className="mt-0.5 text-[12px] text-[#6D28D9]">{weeklyChallenge.tool?.title} · 이번 주 안에 참여</p>
              </div>
              <Link
                href="/challenges/weekly"
                className="inline-flex items-center justify-center rounded-full bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
              >
                참여하기 →
              </Link>
            </div>
          )}

          {hasChallengeActivity && challengeBoard.recentReferences.length > 0 && (
            <div className="mb-5 rounded-[24px] border border-[#ECE7DF] bg-white/85 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">최근 올라온 레퍼런스</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {challengeBoard.recentReferences.slice(0, 2).map((reference) => (
                  <Link
                    key={reference.id}
                    href={`/challenges/${reference.tool_id}`}
                    className="rounded-[20px] border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-4 transition-colors hover:bg-[#F8F5F0]"
                  >
                    <p className="text-sm font-semibold text-[#18181B]">{reference.tool?.title ?? reference.tool_id}</p>
                    <p className="mt-1 text-sm text-[#5F5951]">{reference.title}</p>
                    <p className="mt-2 text-[11px] text-[#938B81]">{reference.submitted_name || "익명"} · {formatShortDate(reference.created_at)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-12 overflow-hidden rounded-[32px] border border-[#E9E2D8] bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#FFFFFF_40%,#F7F3EC_100%)] px-5 py-6 shadow-[0_16px_40px_-30px_rgba(24,24,27,0.28)] sm:px-8 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_280px] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#E7E0D7] bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
                The Nocodes
              </span>
              <span className="rounded-full border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-1 text-[11px] font-bold text-[#0F766E]">
                한국 AI 빌더용 보드
              </span>
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-[#18181B] sm:text-5xl">
              한국 AI 빌더를 위한 실전 보드
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6B6760] sm:text-base">
              지원할 기회, 참석할 행사, 바로 써볼 도구를 한 화면에 모아 보기 편하게 정리합니다.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/hackathons"
                className="inline-flex items-center justify-center rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
              >
                해커톤 보기
              </Link>
              <a
                href="https://open.kakao.com/o/pSpn5mpi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-[#B7DDD6] bg-[#F3FBF9] px-5 py-3 text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#E8F7F3]"
              >
                오픈채팅 참여하기
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-[#E9E2D8] bg-white/85 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">Focus</p>
              <p className="mt-2 text-sm font-semibold text-[#18181B]">마감, 지원, 참석.</p>
              <p className="mt-1 text-sm leading-relaxed text-[#71717A]">
                필요한 것부터 보고, 마음 가는 건 바로 눌러보면 됩니다.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#D9EFEA] bg-[#F7FCFB] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F766E]">Updated Daily</p>
              <p className="mt-2 text-sm font-semibold text-[#123B38]">자동 수집 + 수동 선별</p>
              <p className="mt-1 text-sm leading-relaxed text-[#5C7D78]">
                잡동사니보다 실제로 눌러볼 항목을 우선합니다.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#DDD6FE] bg-[#FAF7FF] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Community</p>
              <p className="mt-2 text-sm font-semibold text-[#4C1D95]">서울 오프라인 밋업 포함</p>
              <p className="mt-1 text-sm leading-relaxed text-[#6D28D9]">
                공고만 모으는 사이트 말고, 실제 현장 동선도 같이 챙깁니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 animate-pulse rounded-[24px] bg-gray-50" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-40 animate-pulse rounded-[24px] bg-gray-50" />
              ))}
            </div>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
