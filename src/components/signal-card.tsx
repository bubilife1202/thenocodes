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
    <article className="group flex h-full flex-col rounded-xl border border-[#ECE7DF] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(24,24,27,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#DDD6FE] hover:shadow-[0_16px_36px_-28px_rgba(124,58,237,0.3)]">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-bold text-[#7C3AED]">
          {SIGNAL_TYPE_LABELS[item.signal_type]}
        </span>
        {item.source_name && <span className="text-[12px] font-medium text-[#8A8278]">{item.source_name}</span>}
        <time dateTime={item.published_at} className="text-[12px] text-[#A8A29A]">
          {formatDate(item.published_at)}
        </time>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-black leading-snug tracking-tight text-[#18181B]">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#5F5951]">{item.summary}</p>

        <div className="mt-4 rounded-2xl border border-[#D9EFEA] bg-[#F3FBF9] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F766E]">
            빌더가 당장 해볼 것
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#115E59]">{item.action_point}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-[#F7F4EE] px-2 py-1 text-[11px] text-[#6B6760]">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center rounded-full border border-[#ECE7DF] bg-[#FCFBF8] px-3 py-2 text-sm font-semibold text-[#18181B] transition-colors hover:border-[#CFC7BB] hover:bg-[#F8F5F0]"
        >
          원문 보기 →
        </a>
      </div>
    </article>
  );
}
