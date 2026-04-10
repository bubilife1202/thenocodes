import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import type { HackathonRow } from "@/lib/data/hackathons";

type Accent = "teal" | "orange";
type Variant = "default" | "featured" | "compact";

const STATUS_COLORS: Record<HackathonStatus, string> = {
  active: "bg-[#EAF7F3] text-[#0F766E]",
  upcoming: "bg-[#EEF5FF] text-[#315E9B]",
  ended: "bg-[#F5F3EF] text-[#A8A29A]",
};

const STATUS_LABELS: Record<Accent, Record<HackathonStatus, string>> = {
  teal: { active: "진행중", upcoming: "예정", ended: "종료" },
  orange: { active: "모집중", upcoming: "예정", ended: "마감" },
};

const ACCENT_STYLES: Record<
  Accent,
  {
    border: string;
    rail: string;
    hover: string;
    title: string;
    surface: string;
    tag: string;
  }
> = {
  teal: {
    border: "border-[#D9EFEA]",
    rail: "bg-[#14B8A6]",
    hover: "hover:border-[#8ED3C6]",
    title: "group-hover:text-[#0F766E]",
    surface: "bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FCFB_100%)]",
    tag: "bg-[#F3FBF9] text-[#0F766E]",
  },
  orange: {
    border: "border-[#F3DDC3]",
    rail: "bg-[#F59E0B]",
    hover: "hover:border-[#E9BC8D]",
    title: "group-hover:text-[#C46A1A]",
    surface: "bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF9F2_100%)]",
    tag: "bg-[#FFF2E4] text-[#C46A1A]",
  },
};

const KR_DATE = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

function formatDate(d: string | null) {
  if (!d) return "미정";
  return KR_DATE.format(new Date(d));
}

function getDday(endsAt: string | null) {
  if (!endsAt) return null;
  const diff = Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000);
  return diff >= 0 ? diff : null;
}

export function EventCard({
  item,
  accent = "teal",
  showTags = false,
  variant = "default",
  className = "",
}: {
  item: HackathonRow;
  accent?: Accent;
  showTags?: boolean;
  variant?: Variant;
  className?: string;
}) {
  const status = getHackathonStatus(item);
  const dday = status === "active" ? getDday(item.ends_at) : null;
  const styles = ACCENT_STYLES[accent];
  const urgent = dday !== null && dday <= 7;
  const featured = variant === "featured";
  const compact = variant === "compact";

  const shellClasses = featured
    ? "rounded-[28px] p-6 shadow-[0_18px_42px_-34px_rgba(24,24,27,0.24)]"
    : compact
      ? "rounded-[22px] p-4 shadow-[0_12px_30px_-30px_rgba(24,24,27,0.18)]"
      : "rounded-[24px] p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.2)]";

  const titleClasses = featured
    ? "text-[22px] sm:text-2xl"
    : compact
      ? "text-base"
      : "text-[18px]";

  const descriptionClasses = featured ? "line-clamp-3" : "line-clamp-2";
  const metaClasses = compact ? "text-[11px]" : "text-[12px]";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} - 외부 사이트에서 열기`}
      className={`group relative block h-full overflow-hidden border transition-all hover:-translate-y-0.5 ${shellClasses} ${urgent ? "border-red-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF5F5_100%)]" : `${styles.border} ${styles.surface}`} ${styles.hover} ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-4 left-0 w-[4px] rounded-r-full ${urgent ? "bg-red-500" : styles.rail}`}
      />

      <div className={`mb-4 flex flex-wrap items-center gap-2 ${compact ? "pl-1" : "pl-2"}`}>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[accent][status]}
        </span>
        {dday !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              dday <= 3
                ? "bg-red-50 text-red-600"
                : dday <= 7
                  ? "bg-[#FFF2E4] text-[#C46A1A]"
                  : "bg-[#F5F3EF] text-[#78716C]"
            }`}
          >
            {dday === 0 ? "오늘 마감" : `마감 D-${dday}`}
          </span>
        )}
        {item.prize && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${styles.tag}`}>{item.prize}</span>}
        {item.source && item.source !== "manual" && (
          <span className="rounded-full bg-[#F5F3EF] px-2 py-1 text-[10px] text-[#78716C]">{item.source}</span>
        )}
      </div>

      <div className="flex h-full flex-col">
        <h3 className={`font-black leading-snug tracking-tight text-[#18181B] transition-colors ${styles.title} ${titleClasses}`}>
          {item.title}
          <span className="sr-only"> (외부 링크)</span>
        </h3>

        {item.description && (
          <p className={`mt-3 text-sm leading-relaxed text-[#6B6760] ${descriptionClasses}`}>{item.description}</p>
        )}

        <div className={`mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[#71717A] ${metaClasses}`}>
          {item.organizer ? <span className="font-medium text-[#4B5563]">{item.organizer}</span> : <span />}
          <span>
            {item.starts_at && <time dateTime={item.starts_at}>{formatDate(item.starts_at)}</time>}
            {" — "}
            {item.ends_at && <time dateTime={item.ends_at}>{formatDate(item.ends_at)}</time>}
            {!item.starts_at && !item.ends_at && "미정"}
          </span>
        </div>

        {showTags && item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.tags.slice(0, compact ? 3 : 4).map((tag) => (
              <span key={tag} className="rounded-full bg-[#F5F3EF] px-2.5 py-1 text-[10px] text-[#78716C]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
