import Link from "next/link";
import {
  getCurrentWeeklyChallenge,
  getRecentWeeklyChallenges,
  getChallengeById,
} from "@/lib/data/challenge-board";
import { submitWeeklyChallengeEntry } from "@/app/challenges/actions";
import { relativeTime } from "@/lib/utils/date";

export default async function WeeklyChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const current = await getCurrentWeeklyChallenge();
  const archives = await getRecentWeeklyChallenges(4);

  const statusMessage =
    query.status === "entry-ok"
      ? "챌린지 참여를 기록했어요!"
      : query.status === "entry-error"
        ? "참여 기록에 실패했어요. 다시 시도해주세요."
        : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/challenges"
        className="text-sm font-semibold text-[#6B6760] hover:text-black"
      >
        ← 실험 도구 전체로
      </Link>

      {current ? (
        <>
          <section className="mt-4 rounded-[30px] border border-[#E6DDFB] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] p-6 shadow-[0_16px_36px_-32px_rgba(124,58,237,0.22)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#7C3AED]" />
                    이번 주 챌린지
                  </span>
                  <span className="rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-semibold text-[#6D28D9]">
                    {current.tool?.title ?? current.challenge.tool_id}
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#938B81]">
                    {current.challenge.week_tag}
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#6B6760]">
                    참여 {current.entries.length}명
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-[#18181B]">
                  {current.challenge.title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#5B21B6]">
                  {current.challenge.description}
                </p>

                {current.challenge.prompt_hint && (
                  <div className="mt-4 rounded-[22px] border border-[#DDD6FE] bg-white/80 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">
                      추천 프롬프트
                    </p>
                    <p className="mt-2 text-[15px] font-semibold leading-relaxed text-[#18181B]">
                      {current.challenge.prompt_hint}
                    </p>
                  </div>
                )}
              </div>

              <a
                href={current.tool?.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
              >
                {current.tool?.ctaLabel ?? "도구 열기 →"}
              </a>
            </div>
          </section>

          {statusMessage && (
            <div className="mt-4 rounded-2xl border border-[#D9EFEA] bg-[#F6FCFB] px-4 py-3 text-sm text-[#0F766E]">
              {statusMessage}
            </div>
          )}

          <section className="mt-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <h2 className="text-xl font-black tracking-tight text-[#18181B]">
              챌린지 참여하기
            </h2>
            <p className="mt-1 text-sm text-[#71717A]">
              도구를 써보고 결과와 교훈을 남겨보세요.
            </p>

            <form
              action={submitWeeklyChallengeEntry}
              className="mt-4 space-y-3 rounded-[22px] bg-[#FAF7F2] p-4"
            >
              <input
                type="hidden"
                name="week_tag"
                value={current.challenge.week_tag}
              />
              <input
                type="hidden"
                name="tool_id"
                value={current.challenge.tool_id}
              />
              <input
                type="text"
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <textarea
                name="result"
                required
                rows={2}
                placeholder="한 줄 결과 — 뭘 해봤고 어땠나요?"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <textarea
                name="takeaway"
                required
                rows={2}
                placeholder="한 줄 교훈 — 다음에 더 잘하려면?"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  name="time_spent"
                  className="rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm text-[#4B5563] outline-none focus:border-[#B8B1A8]"
                >
                  <option value="5분">5분</option>
                  <option value="15분">15분</option>
                  <option value="30분">30분</option>
                  <option value="1시간+">1시간+</option>
                </select>
                <input
                  name="submitted_name"
                  placeholder="이름 또는 팀명 (선택)"
                  className="rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
              >
                참여 기록 남기기
              </button>
            </form>
          </section>

          <section className="mt-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <h2 className="text-lg font-black tracking-tight text-[#18181B]">
              이번 주 참여자
            </h2>
            {current.entries.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#E7E0D7] px-4 py-6 text-center text-sm text-[#A1A1AA]">
                아직 참여자가 없습니다. 첫 참여를 남겨보세요.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {current.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4"
                  >
                    <p className="text-sm leading-relaxed text-[#4B5563]">
                      {entry.body}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#938B81]">
                      <span>{entry.submitted_name || "익명"}</span>
                      <span>·</span>
                      {entry.time_spent && (
                        <>
                          <span>{entry.time_spent}</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{relativeTime(entry.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="mt-4 rounded-[30px] border border-[#ECE7DF] bg-white p-6 text-center shadow-[0_16px_36px_-32px_rgba(24,24,27,0.18)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">
            Weekly Challenge
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#18181B]">
            이번 주 챌린지는 준비 중입니다
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#71717A]">
            매주 월요일에 새로운 챌린지가 시작됩니다. 알림을 받으려면 오픈채팅에
            참여하세요.
          </p>
          <a
            href="https://open.kakao.com/o/pSpn5mpi"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#0F766E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B5F58]"
          >
            오픈채팅 들어가기
          </a>
        </section>
      )}

      {archives.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-black tracking-tight text-[#18181B]">
            지난 챌린지
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {archives
              .filter(
                (a) => !current || a.week_tag !== current.challenge.week_tag
              )
              .slice(0, 4)
              .map((archive) => {
                const tool = getChallengeById(archive.tool_id);
                return (
                  <div
                    key={archive.id}
                    className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-[#938B81]">
                      <span className="rounded-full bg-[#F5F3FF] px-2 py-0.5 font-semibold text-[#6D28D9]">
                        {archive.week_tag}
                      </span>
                      <span>{tool?.title ?? archive.tool_id}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#18181B]">
                      {archive.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#5F5951]">
                      {archive.description}
                    </p>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
