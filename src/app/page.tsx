import { Suspense } from "react";
import Link from "next/link";
import { getHomeData } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { sortHackathons } from "@/lib/hackathons";
import { EventCard } from "@/components/event-card";

export const revalidate = 300;

function ProblemCard({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <a
      href="https://open.kakao.com/o/pSpn5mpi"
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-[#ECE7DF] bg-white p-5 transition-all hover:border-[#B7DDD6] hover:shadow-sm"
    >
      <p className="mb-2 text-sm font-bold text-[#18181B]">{title}</p>
      <p className="mb-4 text-sm leading-relaxed text-[#71717A]">{description}</p>
      <span className="text-xs font-semibold text-[#0F766E] group-hover:text-[#0B5F58]">
        {cta} →
      </span>
    </a>
  );
}

async function HomeContent() {
  const [{ hackathons, contests }, meetups] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(2),
  ]);
  // Ensure at least 1 contest is shown when available
  const sorted = sortHackathons([...hackathons, ...contests]);
  const firstContest = sorted.find((item) => item.category === "contest");
  const withoutFirstContest = firstContest ? sorted.filter((item) => item !== firstContest) : sorted;
  const opportunities = firstContest
    ? [...withoutFirstContest.slice(0, 5), firstContest].sort((a, b) => sorted.indexOf(a) - sorted.indexOf(b))
    : sorted.slice(0, 6);

  return (
    <div className="space-y-14">
      <section id="opportunities" className="scroll-mt-24">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">01</p>
            <h2 className="text-xl font-black tracking-tight text-[#18181B]">실행 기회</h2>
            <p className="mt-1 text-sm text-[#71717A]">
              지금 신청할 수 있는 해커톤과 공모전을 빠르게 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/hackathons"
              className="rounded-lg border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#E8F7F3]"
            >
              해커톤 보기
            </Link>
            <Link
              href="/contests"
              className="rounded-lg border border-[#F3DDC3] bg-[#FFF7EF] px-3 py-1.5 text-xs font-semibold text-[#C46A1A] hover:bg-[#FDF1E4]"
            >
              공모전 보기
            </Link>
            <Link
              href="/meetups"
              className="rounded-lg border border-[#D9EFEA] bg-[#F7FCFB] px-3 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#EAF7F3]"
            >
              밋업 보기
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#D9EFEA] bg-[#F3FBF9] px-3 py-1.5 text-xs font-semibold text-[#0F766E]">
            해커톤
          </span>
          <span className="rounded-full border border-[#F3DDC3] bg-[#FFF7EF] px-3 py-1.5 text-xs font-semibold text-[#C46A1A]">
            공모전
          </span>
          <span className="rounded-full border border-[#D9EFEA] bg-[#F7FCFB] px-3 py-1.5 text-xs font-semibold text-[#0F766E]">
            밋업 / 세미나
          </span>
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
            아직 노출할 실행 기회가 없습니다. 수집이 완료되면 바로 반영됩니다.
          </div>
        )}
      </section>

      {meetups.length > 0 && (
        <section className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">Luma Curated</p>
              <h2 className="text-xl font-black tracking-tight text-[#18181B]">서울 AI 밋업 / 세미나</h2>
              <p className="mt-1 text-sm text-[#71717A]">
                Luma에서 찾은 서울 AI 관련 밋업과 세미나를 선별해서 넣었습니다.
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

      <section id="problems" className="scroll-mt-24">
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">02</p>
          <h2 className="text-xl font-black tracking-tight text-[#18181B]">비즈니스 문제</h2>
          <p className="mt-1 text-sm text-[#71717A]">
            현업에서 부딪히는 문제를 모으고, AI로 풀 수 있는 방향까지 같이 정리하는 트랙입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProblemCard
            title="문제 제보 받기"
            description="업무 자동화, 운영 개선, 데이터 분석처럼 실제 현업 문제를 먼저 수집합니다."
            cta="오픈채팅으로 제보하기"
          />
          <ProblemCard
            title="운영 방식"
            description="긴 실무 인사이트 메뉴를 따로 두기보다, 각 문제와 기회 안에 짧은 준비 가이드로 녹여 넣을 예정입니다."
            cta="의견 보내기"
          />
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-12 rounded-[28px] border border-[#ECE7DF] bg-white px-5 py-7 shadow-[0_8px_30px_-24px_rgba(24,24,27,0.25)] sm:px-8 sm:py-9">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#A1A1AA]">The Nocodes</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-[#18181B] sm:text-4xl">
          실행 기회와 비즈니스 문제를
          <br />
          한 화면에서 정리하는 더노코즈
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#71717A] sm:text-base">
          해커톤과 공모전 같은 실행 기회를 먼저 모으고, 이어서 실제 현업의 비즈니스 문제를 쌓아가는 방식으로 운영합니다.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href="#opportunities"
            className="inline-flex items-center justify-center rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
          >
            실행 기회 보기
          </a>
          <a
            href="https://open.kakao.com/o/pSpn5mpi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-[#B7DDD6] bg-[#F3FBF9] px-4 py-3 text-sm font-semibold text-[#0F766E] transition-colors hover:bg-[#E8F7F3]"
          >
            비즈니스 문제 제보하기
          </a>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-8 w-24 animate-pulse rounded-full bg-gray-50" />
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
