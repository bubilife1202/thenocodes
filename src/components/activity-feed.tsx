import Link from "next/link";
import { relativeTime } from "@/lib/utils/date";

export type ActivityFeedItemType = "reference" | "comment" | "experiment-log";

export interface ActivityFeedItem {
  id: string;
  type: ActivityFeedItemType;
  tool_id: string;
  toolTitle: string;
  body: string;
  submitted_name: string | null;
  created_at: string;
  meta?: string;
}

const TYPE_LABELS: Record<ActivityFeedItemType, string> = {
  reference: "레퍼런스",
  comment: "코멘트",
  "experiment-log": "실험",
};

const TYPE_STYLES: Record<ActivityFeedItemType, string> = {
  reference: "bg-[#F3FBF9] text-[#0F766E]",
  comment: "bg-[#F8F5F0] text-[#6B6760]",
  "experiment-log": "bg-[#FFF2E4] text-[#B45309]",
};

export function buildActivityFeed(
  references: Array<{ id: string; tool_id: string; tool?: { title: string } | null; title: string; url: string; note: string | null; submitted_name: string | null; created_at: string }>,
  comments: Array<{ id: string; tool_id: string; tool?: { title: string } | null; body: string; submitted_name: string | null; created_at: string }>,
  experimentLogs: Array<{ id: string; tool_id: string; tool?: { title: string } | null; body: string; time_spent: string | null; submitted_name: string | null; created_at: string }>
): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [
    ...references.map((r) => ({
      id: r.id,
      type: "reference" as const,
      tool_id: r.tool_id,
      toolTitle: r.tool?.title ?? r.tool_id,
      body: r.title,
      submitted_name: r.submitted_name,
      created_at: r.created_at,
      meta: r.url,
    })),
    ...comments.map((c) => ({
      id: c.id,
      type: "comment" as const,
      tool_id: c.tool_id,
      toolTitle: c.tool?.title ?? c.tool_id,
      body: c.body,
      submitted_name: c.submitted_name,
      created_at: c.created_at,
    })),
    ...experimentLogs.map((e) => ({
      id: e.id,
      type: "experiment-log" as const,
      tool_id: e.tool_id,
      toolTitle: e.tool?.title ?? e.tool_id,
      body: e.body,
      submitted_name: e.submitted_name,
      created_at: e.created_at,
      meta: e.time_spent ?? undefined,
    })),
  ];

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function ActivityFeed({ items, limit = 8 }: { items: ActivityFeedItem[]; limit?: number }) {
  const visible = items.slice(0, limit);

  if (visible.length === 0) {
    return (
      <div className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-6 text-center text-sm text-[#A1A1AA]">
        아직 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((item) => (
        <div key={item.id} className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[item.type]}`}>
              {TYPE_LABELS[item.type]}
            </span>
            <Link
              href={`/challenges/${item.tool_id}`}
              className="text-[12px] font-semibold text-[#18181B] hover:underline"
            >
              {item.toolTitle}
            </Link>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-[#5F5951]">{item.body}</p>
          <p className="mt-2 text-[11px] text-[#938B81]">
            {item.submitted_name ? (
              <Link href={`/challenges/builders/${encodeURIComponent(item.submitted_name)}`} className="hover:underline">{item.submitted_name}</Link>
            ) : "익명"} · {relativeTime(item.created_at)}
            {item.type === "experiment-log" && item.meta && ` · ${item.meta}`}
          </p>
        </div>
      ))}
    </div>
  );
}
