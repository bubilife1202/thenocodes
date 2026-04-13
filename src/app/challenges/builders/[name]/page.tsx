import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallengeBoardOverview, getChallengeById } from "@/lib/data/challenge-board";
import { relativeTime } from "@/lib/utils/date";

type ActivityEntry = {
  id: string;
  type: "reference" | "comment" | "experiment-log";
  tool_id: string;
  body: string;
  created_at: string;
};

const TYPE_LABELS: Record<ActivityEntry["type"], string> = {
  reference: "레퍼런스",
  comment: "코멘트",
  "experiment-log": "실험",
};

const TYPE_STYLES: Record<ActivityEntry["type"], string> = {
  reference: "bg-[#F3FBF9] text-[#0F766E]",
  comment: "bg-[#F5F3EF] text-[#78716C]",
  "experiment-log": "bg-[#FFF7EF] text-[#C46A1A]",
};

export default async function BuilderProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const overview = await getChallengeBoardOverview();

  const activities: ActivityEntry[] = [];

  for (const ref of overview.references) {
    if (ref.submitted_name === decodedName) {
      activities.push({
        id: ref.id,
        type: "reference",
        tool_id: ref.tool_id,
        body: ref.title,
        created_at: ref.created_at,
      });
    }
  }

  for (const comment of overview.comments) {
    if (comment.submitted_name === decodedName) {
      activities.push({
        id: comment.id,
        type: "comment",
        tool_id: comment.tool_id,
        body: comment.body,
        created_at: comment.created_at,
      });
    }
  }

  for (const log of overview.experimentLogs) {
    if (log.submitted_name === decodedName) {
      activities.push({
        id: log.id,
        type: "experiment-log",
        tool_id: log.tool_id,
        body: log.body,
        created_at: log.created_at,
      });
    }
  }

  if (activities.length === 0) {
    notFound();
  }

  activities.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const refCount = activities.filter((a) => a.type === "reference").length;
  const commentCount = activities.filter((a) => a.type === "comment").length;
  const logCount = activities.filter(
    (a) => a.type === "experiment-log"
  ).length;

  // Top tools by activity count
  const toolCounts = new Map<string, number>();
  for (const a of activities) {
    toolCounts.set(a.tool_id, (toolCounts.get(a.tool_id) ?? 0) + 1);
  }
  const topTools = [...toolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([toolId, count]) => ({
      tool: getChallengeById(toolId),
      toolId,
      count,
    }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/challenges"
        className="text-sm font-semibold text-[#6B6760] hover:text-black"
      >
        ← 실험 도구 전체로
      </Link>

      <section className="mt-4 rounded-[30px] border border-[#ECE7DF] bg-white p-6 shadow-[0_16px_36px_-32px_rgba(24,24,27,0.18)] sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A1A1AA]">
          Builder Profile
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#18181B]">
          {decodedName}
        </h1>

        <div className="mt-4 flex flex-wrap gap-3">
          {logCount > 0 && (
            <div className="rounded-[20px] bg-[#FFF7EF] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C46A1A]">
                실험 로그
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight text-[#B45309]">
                {logCount}
              </p>
            </div>
          )}
          {refCount > 0 && (
            <div className="rounded-[20px] bg-[#F3FBF9] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F766E]">
                레퍼런스
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight text-[#0F766E]">
                {refCount}
              </p>
            </div>
          )}
          {commentCount > 0 && (
            <div className="rounded-[20px] bg-[#F5F3EF] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#78716C]">
                코멘트
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight text-[#57534E]">
                {commentCount}
              </p>
            </div>
          )}
        </div>
      </section>

      {topTools.length > 0 && (
        <section className="mt-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
          <h2 className="text-lg font-black tracking-tight text-[#18181B]">
            자주 실험하는 도구
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {topTools.map(({ tool, toolId, count }) => (
              <Link
                key={toolId}
                href={`/challenges/${toolId}`}
                className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] px-4 py-4 transition-colors hover:bg-[#F8F5F0]"
              >
                <p className="text-sm font-semibold text-[#18181B]">
                  {tool?.title ?? toolId}
                </p>
                <p className="mt-1 text-[12px] text-[#938B81]">
                  활동 {count}건
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-[28px] border border-[#ECE7DF] bg-white p-5 shadow-[0_14px_34px_-30px_rgba(24,24,27,0.18)]">
        <h2 className="text-lg font-black tracking-tight text-[#18181B]">
          활동 내역
        </h2>
        <div className="mt-4 space-y-3">
          {activities.map((activity) => {
            const tool = getChallengeById(activity.tool_id);
            return (
              <div
                key={activity.id}
                className="rounded-[22px] border border-[#ECE7DF] bg-[#FCFBF8] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_STYLES[activity.type]}`}
                  >
                    {TYPE_LABELS[activity.type]}
                  </span>
                  <Link
                    href={`/challenges/${activity.tool_id}`}
                    className="text-[12px] font-semibold text-[#18181B] hover:underline"
                  >
                    {tool?.title ?? activity.tool_id}
                  </Link>
                  <span className="text-[11px] text-[#938B81]">
                    {relativeTime(activity.created_at)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5F5951]">
                  {activity.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
