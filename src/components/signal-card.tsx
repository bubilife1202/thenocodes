import type { SignalRow } from "@/lib/data/signals";
import type { SignalType } from "@/lib/signals/constants";

const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  platform_launch: "플랫폼",
  api_tool: "API·도구",
  open_model: "오픈소스",
  policy: "정책",
  research: "연구",
};

const SIGNAL_TYPE_STYLES: Record<
  SignalType,
  {
    shell: string;
    badge: string;
    bar: string;
    source: string;
    title: string;
    summary: string;
    actionBox: string;
    actionText: string;
    actionBody: string;
    button: string;
    footer: string;
  }
> = {
  platform_launch: {
    shell:
      "border-[#DDD6FE] bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] sm:hover:border-[#C4B5FD] sm:hover:shadow-[0_18px_38px_-30px_rgba(124,58,237,0.28)]",
    badge: "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]",
    bar: "bg-[#7C3AED]",
    source: "text-[#6D28D9]",
    title: "group-hover:text-[#6D28D9]",
    summary: "text-[#5F5951]",
    actionBox: "bg-[#F5F3FF]",
    actionText: "text-[#6D28D9]",
    actionBody: "text-[#5B21B6]",
    button: "hover:border-[#C4B5FD] hover:bg-[#FAF7FF]",
    footer: "border-[#E8E1FA]",
  },
  api_tool: {
    shell:
      "border-[#D9EFEA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FCFB_100%)] sm:hover:border-[#9ED7CC] sm:hover:shadow-[0_18px_38px_-30px_rgba(15,118,110,0.28)]",
    badge: "border-[#D9EFEA] bg-[#F3FBF9] text-[#0F766E]",
    bar: "bg-[#0F766E]",
    source: "text-[#0F766E]",
    title: "group-hover:text-[#0F766E]",
    summary: "text-[#5F5951]",
    actionBox: "bg-[#F3FBF9]",
    actionText: "text-[#0F766E]",
    actionBody: "text-[#115E59]",
    button: "hover:border-[#9ED7CC] hover:bg-[#F6FCFB]",
    footer: "border-[#E3F1EE]",
  },
  open_model: {
    shell:
      "border-[#F3DDC3] bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9F1_100%)] sm:hover:border-[#EBC89D] sm:hover:shadow-[0_18px_38px_-30px_rgba(196,106,26,0.28)]",
    badge: "border-[#F3DDC3] bg-[#FFF2E4] text-[#C46A1A]",
    bar: "bg-[#C46A1A]",
    source: "text-[#B45309]",
    title: "group-hover:text-[#B45309]",
    summary: "text-[#5F5951]",
    actionBox: "bg-[#FFF7EF]",
    actionText: "text-[#C46A1A]",
    actionBody: "text-[#9A3412]",
    button: "hover:border-[#EBC89D] hover:bg-[#FFF9F1]",
    footer: "border-[#F4E4D2]",
  },
  policy: {
    shell:
      "border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] sm:hover:border-[#CBD5E1] sm:hover:shadow-[0_18px_38px_-30px_rgba(71,85,105,0.28)]",
    badge: "border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]",
    bar: "bg-[#334155]",
    source: "text-[#475569]",
    title: "group-hover:text-[#334155]",
    summary: "text-[#5F5951]",
    actionBox: "bg-[#F8FAFC]",
    actionText: "text-[#334155]",
    actionBody: "text-[#475569]",
    button: "hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
    footer: "border-[#EAECEF]",
  },
  research: {
    shell:
      "border-[#E5E7EB] bg-[linear-gradient(180deg,#FFFFFF_0%,#F9FAFB_100%)] sm:hover:border-[#D1D5DB] sm:hover:shadow-[0_18px_38px_-30px_rgba(75,85,99,0.28)]",
    badge: "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]",
    bar: "bg-[#4B5563]",
    source: "text-[#4B5563]",
    title: "group-hover:text-[#374151]",
    summary: "text-[#5F5951]",
    actionBox: "bg-[#F9FAFB]",
    actionText: "text-[#4B5563]",
    actionBody: "text-[#374151]",
    button: "hover:border-[#D1D5DB] hover:bg-[#F9FAFB]",
    footer: "border-[#E5E7EB]",
  },
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
  const styles = SIGNAL_TYPE_STYLES[item.signal_type];

  return (
    <article
      className={`group flex h-full flex-col gap-4 rounded-[28px] border p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.22)] transition-all sm:p-6 sm:hover:-translate-y-0.5 ${styles.shell}`}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles.badge}`}>
          {SIGNAL_TYPE_LABELS[item.signal_type]}
        </span>
        {item.source_name && <span className={`text-[12px] font-semibold ${styles.source}`}>{item.source_name}</span>}
        <time
          dateTime={item.published_at}
          className="text-[12px] text-[#8A8278] before:mr-2 before:text-[#D7D0C7] before:content-['·']"
        >
          {formatDate(item.published_at)}
        </time>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        <h3 className={`line-clamp-2 text-[19px] font-black leading-snug tracking-tight text-[#18181B] transition-colors sm:text-[20px] ${styles.title}`}>
          {item.title}
        </h3>
        <p className={`line-clamp-3 text-[13px] leading-relaxed sm:text-[14px] ${styles.summary}`}>{item.summary}</p>
      </div>

      <div className={`relative rounded-[22px] p-4 pl-5 ${styles.actionBox}`}>
        <span aria-hidden className={`absolute inset-y-3 left-0 w-[4px] rounded-r-full ${styles.bar}`} />
        <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${styles.actionText}`}>빌더가 당장 해볼 것</p>
        <p className={`mt-2 line-clamp-3 text-[13px] leading-relaxed ${styles.actionBody}`}>{item.action_point}</p>
      </div>

      <footer className={`mt-auto flex flex-col gap-4 border-t pt-4 ${styles.footer}`}>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] text-[#5F5951]">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-1 rounded-2xl border border-[#ECE7DF] bg-white/80 px-3 py-3 text-sm font-semibold text-[#18181B] transition-colors ${styles.button}`}
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
