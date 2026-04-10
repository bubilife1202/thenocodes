import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals } from "@/lib/data/signals";
import { getFeaturedChallenges } from "@/lib/data/challenges";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { EventCard } from "@/components/event-card";
import { SignalCard } from "@/components/signal-card";
import { ChallengeCard } from "@/components/challenge-card";

export const revalidate = 300;

async function HomeContent() {
  const [{ hackathons, contests }, meetups, signals, challenges, stats] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(2),
    getFeaturedSignals(2),
    getFeaturedChallenges(4),
    getStats(),
  ]);

  // Ensure at least 1 contest is shown when available
  const sorted = sortHackathons([...hackathons, ...contests]);
  const firstContest = sorted.find((item) => item.category === "contest");
  const withoutFirstContest = firstContest ? sorted.filter((item) => item !== firstContest) : sorted;
  const opportunities = firstContest
    ? [...withoutFirstContest.slice(0, 5), firstContest].sort((a, b) => sorted.indexOf(a) - sorted.indexOf(b))
    : sorted.slice(0, 6);

  // Deadline soon: events ending within 7 days
  const now = new Date();
  const deadlineSoon = sorted.filter((item) => {
    if (!item.ends_at || getHackathonStatus(item, now) !== "active") return false;
    const daysLeft = Math.ceil((new Date(item.ends_at).getTime() - now.getTime()) / 86400000);
    return daysLeft >= 0 && daysLeft <= 7;
  });

  return (
    <div className="space-y-14">
      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl border border-[#ECE7DF] bg-white p-4 text-center">
          <p className="text-2xl font-black text-[#0F766E]">{stats.hackathons}</p>
          <p className="text-xs text-[#71717A]">진행중 해커톤</p>
        </div>
        <div className="flex-1 rounded-xl border border-[#ECE7DF] bg-white p-4 text-center">
          <p className="text-2xl font-black text-[#C46A1A]">{stats.contests}</p>
          <p className="text-xs text-[#71717A]">모집중 공모전</p>
        </div>
        <div className="flex-1 rounded-xl border border-[#ECE7DF] bg-white p-4 text-center">
          <p className="text-2xl font-black text-[#0F766E]">{stats.meetups}</p>
          <p className="text-xs text-[#71717A]">밋업 / 세미나</p>
        </div>
      </div>

      {/* Deadline soon */}
      {deadlineSoon.length > 0 && (
        <section className="scroll-mt-24">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">마감 임박</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {deadlineSoon.slice(0, 4).map((item) => (
              <EventCard key={item.id} item={item} accent={item.category === "contest" ? "orange" : "teal"} />
            ))}
          </div>
        </section>
      )}

      {/* Opportunities */}
      <section className="scroll-mt-24">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#18181B]">해커톤 · 공모전</h2>
            <p className="mt-1 text-sm text-[#71717A]">
              지금 신청할 수 있는 해커톤과 공모전을 빠르게 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/hackathons"
              className="rounded-lg border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#E8F7F3]"
            >
              해커톤 전체
            </Link>
            <Link
              href="/contests"
              className="rounded-lg border border-[#F3DDC3] bg-[#FFF7EF] px-3 py-1.5 text-xs font-semibold text-[#C46A1A] hover:bg-[#FDF1E4]"
            >
              공모전 전체
            </Link>
          </div>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {opportunities.map((item, index) => (
              <EventCard
                key={`${item.id}-${index}`}
                item={item}
                accent={item.category === "contest" ? "orange" : "teal"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ECE7DF] bg-white p-8 text-sm text-[#71717A]">
            등록된 해커톤/공모전이 없습니다. 매일 자동으로 업데이트됩니다.
          </div>
        )}
      </section>

      {/* Signals */}
      {signals.length > 0 && (
        <section className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#18181B]">흐름</h2>
              <p className="mt-1 text-sm text-[#71717A]">
                지금 빌더가 챙겨야 할 플랫폼, API, 오픈모델, 정책 변화를 모았습니다.
              </p>
            </div>
            <Link
              href="/signals"
              className="rounded-lg border border-[#E9DDFE] bg-[#FAF7FF] px-3 py-1.5 text-xs font-semibold text-[#7C3AED] hover:bg-[#F3EDFF]"
            >
              전체 흐름 보기
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {signals.map((item) => (
              <SignalCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* AI Side Quests */}
      {challenges.length > 0 && (
        <section className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#18181B]">AI로 딴짓</h2>
              <p className="mt-1 text-sm text-[#71717A]">
                심심할 때 눌러볼 만한 AI 사이트들만 가볍게 모아뒀습니다.
              </p>
            </div>
            <Link
              href="/challenges"
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#18181B] hover:bg-[#F8F5F0]"
            >
              전체 보기
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {challenges.map((item) => (
              <ChallengeCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Meetups */}
      {meetups.length > 0 && (
        <section className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#18181B]">서울 AI 밋업</h2>
              <p className="mt-1 text-sm text-[#71717A]">
                Luma에서 찾은 서울 AI 밋업과 세미나를 선별했습니다.
              </p>
            </div>
            <Link
              href="/meetups"
              className="rounded-lg border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#E8F7F3]"
            >
              전체 밋업 보기
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {meetups.map((item) => (
              <EventCard key={item.id} item={item} accent="teal" showTags />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-12 rounded-[28px] border border-[#ECE7DF] bg-white px-5 py-7 shadow-[0_8px_30px_-24px_rgba(24,24,27,0.25)] sm:px-8 sm:py-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">The Nocodes</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">
          No Code, Only Action.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#71717A] sm:text-base">
          실행하는 메이커들의 아지트. 한국 AI 해커톤, 공모전, 밋업을 매일 자동으로 모아둡니다.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/hackathons"
            className="inline-flex items-center justify-center rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
          >
            해커톤 보기
          </Link>
          <a
            href="https://open.kakao.com/o/pSpn5mpi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-[#B7DDD6] bg-[#F3FBF9] px-4 py-3 text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#E8F7F3]"
          >
            오픈채팅 참여하기
          </a>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="flex gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 flex-1 animate-pulse rounded-xl bg-gray-50" />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-40 animate-pulse rounded-xl bg-gray-50" />
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
