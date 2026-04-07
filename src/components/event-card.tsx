import { getHackathonStatus, type HackathonStatus } from "@/lib/hackathons";
import type { HackathonRow } from "@/lib/data/hackathons";

type Accent = "teal" | "orange";

const STATUS_COLORS: Record<HackathonStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  upcoming: "bg-blue-50 text-blue-700",
  ended: "bg-gray-50 text-gray-400",
};

const STATUS_LABELS: Record<Accent, Record<HackathonStatus, string>> = {
  teal: { active: "진행중", upcoming: "예정", ended: "종료" },
  orange: { active: "모집중", upcoming: "예정", ended: "마감" },
};

const ACCENT_STYLES: Record<Accent, { hover: string; title: string }> = {
  teal: { hover: "hover:border-emerald-200", title: "group-hover:text-emerald-600" },
  orange: { hover: "hover:border-orange-200", title: "group-hover:text-orange-600" },
};

function formatDate(d: string | null) {
  if (!d) return "미정";
  return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
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
      className={`group block p-5 border rounded-xl hover:shadow-sm transition-all ${
        urgent ? "bg-red-50/30 border-red-200" : "bg-white border-gray-100"
      } ${styles.hover}`}
    >
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[accent][status]}
        </span>
        {dday !== null && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            dday <= 3 ? "bg-red-50 text-red-600" : dday <= 7 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500"
          }`}>
            {dday === 0 ? "오늘 마감" : `마감 D-${dday}`}
          </span>
        )}
        {item.prize && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {item.prize}
          </span>
        )}
        {item.source && item.source !== "manual" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-[#A1A1AA]">
            {item.source}
          </span>
        )}
      </div>

      <h3 className={`font-bold text-[#18181B] ${styles.title} transition-colors mb-1.5 leading-snug`}>
        {item.title}
      </h3>

      {item.description && (
        <p className="text-sm text-[#71717A] line-clamp-2 mb-3">{item.description}</p>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
        <span>{item.organizer ?? ""}</span>
        <span>{formatDate(item.starts_at)} — {formatDate(item.ends_at)}</span>
      </div>

      {showTags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] text-[#A1A1AA] px-2 py-0.5 rounded bg-gray-50">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
