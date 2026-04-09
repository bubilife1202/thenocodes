import { getFeedbackColumns, type FeedbackPriority, type FeedbackStatus } from "@/lib/data/feedback";

export const revalidate = 60;

const STATUS_META: Record<FeedbackStatus, { label: string; tone: string }> = {
  inbox: { label: "Inbox", tone: "border-[#ECE7DF] bg-white text-[#57534E]" },
  queued: { label: "대기중", tone: "border-[#E7E0D7] bg-[#FAF7F2] text-[#6B6760]" },
  in_progress: { label: "진행중", tone: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]" },
  review: { label: "검토중", tone: "border-[#D8E7F8] bg-[#F4F8FE] text-[#315E9B]" },
  done: { label: "완료", tone: "border-[#E1EAD9] bg-[#F7FBF3] text-[#4D7C0F]" },
  archived: { label: "보류", tone: "border-[#ECE7DF] bg-[#F7F4EE] text-[#78716C]" },
};

const PRIORITY_META: Record<FeedbackPriority, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음",
};

export default async function FeedbackPage() {
  const columns = await getFeedbackColumns();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">Feedback Board</p>
          <h1 className="text-2xl font-black tracking-tight text-[#18181B]">더노코즈 피드백 보드</h1>
          <p className="mt-2 text-sm text-[#71717A]">
            커뮤니티에서 올라온 제안과 운영 피드백을 대기중 / 진행중 / 완료 상태로 공개합니다.
          </p>
        </div>
        <div className="rounded-2xl border border-[#ECE7DF] bg-white px-4 py-3 text-sm text-[#6B6760]">
          제출 폼은 다음 단계에서 붙일 예정. 우선은 공개 보드부터 시작합니다.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {columns.map((column) => {
          const meta = STATUS_META[column.status];
          return (
            <section key={column.status} className="rounded-[24px] border border-[#ECE7DF] bg-[#FCFBF8] p-3">
              <div className={`mb-3 rounded-2xl border px-3 py-2 ${meta.tone}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">{meta.label}</p>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-[#6B6760]">
                    {column.items.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {column.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#E7E0D7] bg-white px-3 py-5 text-center text-xs text-[#A1A1AA]">
                    아직 카드 없음
                  </div>
                ) : (
                  column.items.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#ECE7DF] bg-white p-4 shadow-[0_10px_24px_-22px_rgba(24,24,27,0.45)]">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#E7E0D7] bg-[#FCFBF8] px-2 py-0.5 text-[10px] font-bold text-[#8A8278]">
                          {item.kind}
                        </span>
                        <span className="rounded-full border border-[#E7E0D7] bg-[#FCFBF8] px-2 py-0.5 text-[10px] font-bold text-[#8A8278]">
                          {PRIORITY_META[item.priority]}
                        </span>
                        <span className="rounded-full border border-[#E7E0D7] bg-[#FCFBF8] px-2 py-0.5 text-[10px] font-bold text-[#8A8278]">
                          👍 {item.vote_count}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold leading-snug text-[#18181B]">{item.title}</h2>
                      <p className="mt-2 line-clamp-5 text-xs leading-relaxed text-[#71717A]">{item.body}</p>
                      {item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-[#F5F3EF] px-2 py-0.5 text-[10px] text-[#78716C]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
