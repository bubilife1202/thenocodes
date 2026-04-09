import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import type { HackathonRow } from "@/lib/data/hackathons";

type Accent = "teal" | "orange";

const STATUS_COLORS: Record<HackathonStatus, string> = {
  active: "bg-[#EAF7F3] text-[#0F766E]",
  upcoming: "bg-[#EEF5FF] text-[#315E9B]",
  ended: "bg-[#F5F3EF] text-[#A8A29A]",
};

const STATUS_LABELS: Record<Accent, Record<HackathonStatus, string>> = {
  teal: { active: "진행중", upcoming: "예정", ended: "종료" },
  orange: { active: "모집중", upcoming: "예정", ended: "마감" },
};

const ACCENT_STYLES: Record<Accent, { hover: string; title: string }> = {
  teal: { hover: "hover:border-[#B7DDD6]", title: "group-hover:text-[#0F766E]" },
  orange: { hover: "hover:border-[#F3DDC3]", title: "group-hover:text-[#C46A1A]" },
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
}: {
  item: HackathonRow;
  accent?: Accent;
  showTags?: boolean;
}) {
  const status = getHackathonStatus(item);
  const dday = status === "active" ? getDday(item.ends_at) : null;
  const styles = ACCENT_STYLES[accent];
  const urgent = dday !== null && dday <= 7;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} - 외부 사이트에서 열기`}
      className={`group block rounded-xl border p-5 transition-all hover:shadow-sm ${
        urgent ? "border-red-200 bg-red-50/30" : "border-[#ECE7DF] bg-white"
      } ${styles.hover}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[accent][status]}
        </span>
        {dday !== null && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
        {item.prize && (
          <span className="rounded-full bg-[#FFF2E4] px-2 py-0.5 text-[10px] font-bold text-[#C46A1A]">
            {item.prize}
          </span>
        )}
        {item.source && item.source !== "manual" && (
          <span className="rounded bg-[#F5F3EF] px-1.5 py-0.5 text-[10px] text-[#78716C]">
            {item.source}
          </span>
        )}
      </div>

      <h3 className={`mb-1.5 font-extrabold leading-snug text-[#18181B] transition-colors ${styles.title}`}>
        {item.title}
        <span className="sr-only"> (외부 링크)</span>
      </h3>

      {item.description && <p className="mb-3 line-clamp-2 text-sm text-[#71717A]">{item.description}</p>}

      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#71717A]">
        <span>{item.organizer ?? ""}</span>
        <span>
          {item.starts_at && <time dateTime={item.starts_at}>{formatDate(item.starts_at)}</time>}
          {" — "}
          {item.ends_at && <time dateTime={item.ends_at}>{formatDate(item.ends_at)}</time>}
          {!item.starts_at && !item.ends_at && "미정"}
        </span>
      </div>

      {showTags && item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded bg-[#F5F3EF] px-2 py-0.5 text-[10px] text-[#78716C]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
