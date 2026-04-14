import { Suspense } from "react";
import Link from "next/link";
import { getHomeData, getStats } from "@/lib/data/hackathons";
import { getFeaturedMeetups } from "@/lib/data/meetups";
import { getFeaturedSignals } from "@/lib/data/signals";
import { getHackathonStatus, sortHackathons } from "@/lib/hackathons";
import { formatShortDate } from "@/lib/utils/date";
import type { SignalType } from "@/lib/signals/constants";

export const revalidate = 300;

const SIGNAL_TYPE_KO: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API",
  open_model: "오픈모델",
  policy: "정책",
  research: "연구",
};

async function HomeContent() {
  const [
    { hackathons, contests },
    meetups,
    signals,
    stats,
  ] = await Promise.all([
    getHomeData(),
    getFeaturedMeetups(4),
    getFeaturedSignals(4),
    getStats(),
  ]);

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
