import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallengeToolPageData } from "@/lib/data/challenge-board";
import { submitChallengeComment, submitChallengeReference, submitExperimentLog } from "@/app/challenges/actions";
import { formatDateTime as formatDate } from "@/lib/utils/date";

export const revalidate = 300;

export default async function ChallengeToolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const data = await getChallengeToolPageData(id);

  if (!data) {
    notFound();
  }

  const { tool, references, comments, experimentLogs, counts, uniqueContributorCount, weeklyActivityCount } = data;
  const statusMessage =
    query.status === "reference-ok"
      ? "레퍼런스를 추가했어요."
      : query.status === "comment-ok"
        ? "코멘트를 남겼어요."
        : query.status === "log-ok"
          ? "실험 로그를 기록했어요."
          : query.status === "reference-error"
            ? "레퍼런스 저장에 실패했어요."
            : query.status === "comment-error"
              ? "코멘트 저장에 실패했어요."
              : query.status === "log-error"
                ? "실험 로그 저장에 실패했어요."
                : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/challenges" className="text-sm font-semibold text-[#6B6760] hover:text-black">
        ← 실험 도구 전체로
      </Link>

      <section className="mt-4 rounded-[30px] border border-[#ECE7DF] bg-white p-6 shadow-[0_16px_36px_-32px_rgba(24,24,27,0.18)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#938B81]">
              <span className="rounded-full bg-[#F5F3EF] px-2.5 py-1">{tool.sourceName}</span>
              <span className="rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[#315E9B]">
                {tool.koreanSupport === "full" ? "한국어 좋음" : tool.koreanSupport === "partial" ? "한국어 보통" : "영문 중심"}
              </span>
              <span className="rounded-full bg-[#FFF7EF] px-2.5 py-1 text-[#C46A1A]">
                {tool.pricingTier === "free" ? "무료" : tool.pricingTier === "freemium" ? "부분 무료" : "유료 중심"}
              </span>
              {counts.referenceCount > 0 && <span className="rounded-full bg-[#F5F3EF] px-2.5 py-1">레퍼런스 {counts.referenceCount}</span>}
              {counts.commentCount > 0 && <span className="rounded-full bg-[#F5F3EF] px-2.5 py-1">코멘트 {counts.commentCount}</span>}
              {uniqueContributorCount > 0 && <span className="rounded-full bg-[#F5F3EF] px-2.5 py-1">실험한 빌더 {uniqueContributorCount}명</span>}
              {weeklyActivityCount > 0 && <span className="rounded-full bg-[#F5F3EF] px-2.5 py-1">최근 7일 활동 {weeklyActivityCount}건</span>}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#18181B]">{tool.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#5F5951]">{tool.description}</p>
            <div className="mt-4 rounded-[22px] bg-[#F8F5F0] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">샘플 활용</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{tool.useCase}</p>
            </div>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
          >
            {tool.ctaLabel ?? "도구 열기 →"}
          </a>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#F5F3EF] px-2.5 py-1 text-[11px] text-[#6B6760]">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A1A1AA]">바로 써보는 업무 레시피</p>
          <div className="mt-3 space-y-3">
            {tool.recipes.map((recipe) => (
              <div key={`${tool.id}-${recipe.scenario}`} className="rounded-2xl bg-white px-4 py-4 text-sm leading-relaxed text-[#4B5563]">
                <p className="font-semibold text-[#18181B]">{recipe.scenario}</p>
                <p className="mt-2">{recipe.prompt}</p>
                <p className="mt-2 text-[12px] text-[#938B81]">예상 시간 {recipe.expectedTime} · 결과물 {recipe.resultHint}</p>
              </div>
            ))}
          </div>
        </div>

        {statusMessage && (
          <div className="mt-5 rounded-2xl border border-[#D9EFEA] bg-[#F6FCFB] px-4 py-3 text-sm text-[#0F766E]">
            {statusMessage}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
        <h2 className="text-xl font-black tracking-tight text-[#18181B]">실험 로그</h2>
        <p className="mt-1 text-sm text-[#71717A]">이 도구로 뭘 해봤는지, 어떤 결과가 나왔는지 가볍게 남겨보세요.</p>

        <form action={submitExperimentLog} className="mt-4 space-y-3 rounded-[22px] bg-[#FAF7F2] p-4">
          <input type="hidden" name="tool_id" value={tool.id} />
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <textarea
            name="result"
            rows={2}
            required
            placeholder="한 줄 결과 — 뭘 해봤고 어땠나요?"
            className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
          />
          <textarea
            name="takeaway"
            rows={2}
            required
            placeholder="한 줄 교훈 — 다음에 더 잘하려면?"
            className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
          />
          <input
            name="scenario"
            placeholder="어떤 상황에서 써봤나요? (선택)"
            className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="time_spent"
              className="rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
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
            className="inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
          >
            실험 기록 남기기
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {experimentLogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E7E0D7] px-4 py-6 text-sm">
              <p className="font-semibold text-[#18181B]">아직 실험 로그가 없습니다</p>
              <p className="mt-1 text-[#A1A1AA]">이 도구로 2분짜리 실험을 해보고 결과를 남겨보세요.</p>
              {tool.recipes[0] && (
                <div className="mt-3 rounded-2xl bg-[#F8F5F0] px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A1A1AA]">추천 레시피</p>
                  <p className="mt-1 font-semibold text-[#18181B]">{tool.recipes[0].scenario}</p>
                  <p className="mt-1 text-[#6B6760]">{tool.recipes[0].prompt}</p>
                </div>
              )}
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
              >
                {tool.ctaLabel ?? "도구 열기 →"}
              </a>
            </div>
          ) : (
            experimentLogs.map((log) => {
              const [result, takeaway] = log.body.split("\n");
              return (
                <div key={log.id} className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4">
                  <p className="text-sm font-semibold leading-relaxed text-[#18181B]">{result}</p>
                  {takeaway && <p className="mt-1 text-sm leading-relaxed text-[#5F5951]">{takeaway}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#938B81]">
                    {log.time_spent && (
                      <span className="rounded-full bg-[#F5F3EF] px-2 py-0.5">{log.time_spent}</span>
                    )}
                    {log.scenario && (
                      <span className="rounded-full bg-[#F5F3EF] px-2 py-0.5">{log.scenario}</span>
                    )}
                    {log.submitted_name ? (
                      <Link href={`/challenges/builders/${encodeURIComponent(log.submitted_name)}`} className="ml-auto hover:underline">{log.submitted_name}</Link>
                    ) : (
                      <span className="ml-auto">익명</span>
                    )}
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-[#18181B]">레퍼런스</h2>
                <p className="mt-1 text-sm text-[#71717A]">실제로 참고할 링크, 사례, 정리글을 쌓는 공간.</p>
              </div>
            </div>

            <form action={submitChallengeReference} className="mb-6 space-y-3 rounded-[22px] bg-[#FAF7F2] p-4">
              <input type="hidden" name="tool_id" value={tool.id} />
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="title"
                  required
                  placeholder="레퍼런스 제목"
                  className="rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
                />
                <input
                  name="url"
                  required
                  placeholder="https://..."
                  className="rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
                />
              </div>
              <input
                name="submitted_name"
                placeholder="이름 또는 팀명 (선택)"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <textarea
                name="note"
                rows={3}
                placeholder="왜 참고할 만한지, 어디에 도움이 되는지 짧게 적어주세요"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-[#18181B] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A]"
              >
                레퍼런스 추가
              </button>
            </form>

            <div className="space-y-3">
              {references.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E7E0D7] px-4 py-6 text-sm text-[#A1A1AA]">
                  아직 레퍼런스가 없습니다. 첫 링크를 남겨보세요.
                </div>
              ) : (
                references.map((reference) => (
                  <div key={reference.id} className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#18181B] hover:underline"
                        >
                          {reference.title}
                        </a>
                        {reference.note && <p className="mt-2 text-sm leading-relaxed text-[#5F5951]">{reference.note}</p>}
                      </div>
                      <div className="text-[11px] text-[#938B81] sm:text-right">
                        <p>{reference.submitted_name ? <Link href={`/challenges/builders/${encodeURIComponent(reference.submitted_name)}`} className="hover:underline">{reference.submitted_name}</Link> : "익명"}</p>
                        <p>{formatDate(reference.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
            <h2 className="text-xl font-black tracking-tight text-[#18181B]">코멘트</h2>
            <p className="mt-1 text-sm text-[#71717A]">짧은 사용 후기, 쓰는 팁, 같이 볼 만한 맥락을 남겨보세요.</p>

            <form action={submitChallengeComment} className="mt-4 space-y-3 rounded-[22px] bg-[#FAF7F2] p-4">
              <input type="hidden" name="tool_id" value={tool.id} />
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <input
                name="submitted_name"
                placeholder="이름 또는 팀명 (선택)"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <textarea
                name="body"
                rows={4}
                required
                placeholder="이 도구를 어디에 써봤는지, 어떤 점이 괜찮았는지 적어주세요"
                className="w-full rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm outline-none focus:border-[#B8B1A8]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-[#E7E0D7] bg-white px-4 py-3 text-sm font-semibold text-[#18181B] transition-colors hover:bg-[#F8F5F0]"
              >
                코멘트 남기기
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E7E0D7] px-4 py-6 text-sm text-[#A1A1AA]">
                  아직 코멘트가 없습니다. 첫 사용 후기를 남겨보세요.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4">
                    <p className="text-sm leading-relaxed text-[#4B5563]">{comment.body}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#938B81]">
                      <span>{comment.submitted_name ? <Link href={`/challenges/builders/${encodeURIComponent(comment.submitted_name)}`} className="hover:underline">{comment.submitted_name}</Link> : "익명"}</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
