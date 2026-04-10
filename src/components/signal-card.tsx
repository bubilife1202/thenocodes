import type { SignalRow } from "@/lib/data/signals";
import type { SignalType } from "@/lib/signals/constants";

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API·도구",
  open_model: "오픈소스",
  policy: "정책",
};

const KR_DATE = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

function formatDate(value: string) {
  return KR_DATE.format(new Date(value));
}

export function SignalCard({ item }: { item: SignalRow }) {
  return (
    <article className="group flex h-full flex-col gap-4 rounded-2xl border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(24,24,27,0.28)] transition-all sm:p-6 sm:hover:-translate-y-0.5 sm:hover:border-[#DDD6FE] sm:hover:shadow-[0_16px_36px_-28px_rgba(124,58,237,0.3)]">
      {/* Header: 분류 + 출처 + 날짜 */}
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-bold text-[#7C3AED]">
          {SIGNAL_TYPE_LABELS[item.signal_type]}
        </span>
        {item.source_name && (
          <span className="text-[12px] font-medium text-[#6B6760]">{item.source_name}</span>
        )}
        <time
          dateTime={item.published_at}
          className="text-[12px] text-[#8A8278] before:mr-2 before:text-[#D7D0C7] before:content-['·']"
        >
          {formatDate(item.published_at)}
        </time>
      </header>

      {/* 제목 + 요약 */}
      <div className="flex flex-1 flex-col gap-3">
        <h3 className="line-clamp-2 text-[17px] font-black leading-snug tracking-tight text-[#18181B] sm:text-[18px]">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-[13px] leading-relaxed text-[#5F5951] sm:text-[14px]">
          {item.summary}
        </p>
      </div>

      {/* 액션 박스 — 좌측 accent bar로 계층 낮춤 */}
      <div className="relative rounded-xl bg-[#F3FBF9] p-3.5 pl-4">
        <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#0F766E]" />
        <p className="text-[11px] font-bold text-[#0F766E]">빌더가 당장 해볼 것</p>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[#115E59]">
          {item.action_point}
        </p>
      </div>

      {/* 태그 + 원문 보기 */}
      <footer className="mt-auto flex flex-col gap-4 border-t border-[#F0EAE0] pt-4">
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F7F4EE] px-2 py-0.5 text-[11px] text-[#5F5951]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-[#ECE7DF] bg-[#FCFBF8] px-3 py-2.5 text-sm font-semibold text-[#18181B] transition-colors hover:border-[#CFC7BB] hover:bg-[#F8F5F0]"
        >
          원문 보기
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </footer>
    </article>
  );
}
