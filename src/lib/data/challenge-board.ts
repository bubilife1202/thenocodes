import { createAdminClient } from "@/lib/supabase/admin";
import { getChallenges, type ChallengeItem } from "@/lib/data/challenges";
import { getSeoulISOWeek } from "@/lib/utils/date";
import {
  SEEDED_CHALLENGE_COMMENTS,
  SEEDED_CHALLENGE_EXPERIMENT_LOGS,
  SEEDED_CHALLENGE_REFERENCES,
} from "@/lib/data/challenge-board-seed";

export interface ChallengeReferenceRow {
  id: string;
  tool_id: string;
  title: string;
  url: string;
  note: string | null;
  submitted_name: string | null;
  created_at: string;
}

export interface ChallengeCommentRow {
  id: string;
  tool_id: string;
  body: string;
  submitted_name: string | null;
  created_at: string;
}

export interface ExperimentLogRow {
  id: string;
  tool_id: string;
  body: string;
  time_spent: string | null;
  scenario: string | null;
  submitted_name: string | null;
  created_at: string;
}

export interface ChallengeCommunityCounts {
  referenceCount: number;
  commentCount: number;
  experimentLogCount: number;
}

const FEEDBACK_FIELDS = "id,title,body,submitter_name,related_url,tags,created_at" as const;

type ChallengeBoardFeedbackRow = {
  id: string;
  title: string;
  body: string;
  submitter_name: string | null;
  related_url: string | null;
  tags: string[];
  created_at: string;
};

function emptyCounts(): ChallengeCommunityCounts {
  return { referenceCount: 0, commentCount: 0, experimentLogCount: 0 };
}

export function getChallengeById(id: string) {
  return getChallenges().find((item) => item.id === id) ?? null;
}

function getTagValue(tags: string[], prefix: string) {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) ?? null;
}

function dedupeById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function sortByCreatedAtDesc<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export interface WeeklyChallengeRow {
  id: string;
  week_tag: string;
  tool_id: string;
  title: string;
  description: string;
  prompt_hint: string;
  created_at: string;
}

export interface WeeklyChallengeEntryRow {
  id: string;
  week_tag: string;
  tool_id: string;
  body: string;
  time_spent: string | null;
  submitted_name: string | null;
  created_at: string;
}

function parseChallengeBoardRows(rows: ChallengeBoardFeedbackRow[]) {
  const references: ChallengeReferenceRow[] = [];
  const comments: ChallengeCommentRow[] = [];
  const experimentLogs: ExperimentLogRow[] = [];
  const weeklyChallenges: WeeklyChallengeRow[] = [];
  const challengeEntries: WeeklyChallengeEntryRow[] = [];

  for (const row of rows) {
    const entryType = getTagValue(row.tags, "entry:");
    if (!entryType) continue;

    if (entryType === "weekly-challenge") {
      const weekTag = getTagValue(row.tags, "week:") ?? "";
      const toolId = getTagValue(row.tags, "challenge:") ?? "";
      weeklyChallenges.push({
        id: row.id,
        week_tag: weekTag,
        tool_id: toolId,
        title: row.title,
        description: row.body,
        prompt_hint: row.related_url ?? "",
        created_at: row.created_at,
      });
      continue;
    }

    if (entryType === "challenge-entry") {
      const weekTag = getTagValue(row.tags, "week:") ?? "";
      const toolId = getTagValue(row.tags, "challenge:") ?? "";
      challengeEntries.push({
        id: row.id,
        week_tag: weekTag,
        tool_id: toolId,
        body: row.body,
        time_spent: getTagValue(row.tags, "time-spent:"),
        submitted_name: row.submitter_name,
        created_at: row.created_at,
      });
      continue;
    }

    const toolId = getTagValue(row.tags, "challenge:");
    if (!toolId) continue;

    if (entryType === "reference" && row.related_url) {
      references.push({
        id: row.id,
        tool_id: toolId,
        title: row.title,
        url: row.related_url,
        note: row.body || null,
        submitted_name: row.submitter_name,
        created_at: row.created_at,
      });
    }

    if (entryType === "comment") {
      comments.push({
        id: row.id,
        tool_id: toolId,
        body: row.body,
        submitted_name: row.submitter_name,
        created_at: row.created_at,
      });
    }

    if (entryType === "experiment-log") {
      experimentLogs.push({
        id: row.id,
        tool_id: toolId,
        body: row.body,
        time_spent: getTagValue(row.tags, "time-spent:"),
        scenario: getTagValue(row.tags, "scenario:"),
        submitted_name: row.submitter_name,
        created_at: row.created_at,
      });
    }
  }

  return { references, comments, experimentLogs, weeklyChallenges, challengeEntries };
}

export async function getChallengeBoardOverview() {
  const supabase = createAdminClient();
  const result = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board"])
    .order("created_at", { ascending: false })
    .limit(300);

  if (result.error) {
    console.error("Failed to fetch challenge board entries:", result.error.message);
  }

  const parsed = parseChallengeBoardRows((result.data ?? []) as ChallengeBoardFeedbackRow[]);
  const references = sortByCreatedAtDesc(dedupeById([...parsed.references, ...SEEDED_CHALLENGE_REFERENCES]));
  const comments = sortByCreatedAtDesc(dedupeById([...parsed.comments, ...SEEDED_CHALLENGE_COMMENTS]));
  const experimentLogs = sortByCreatedAtDesc(dedupeById([...parsed.experimentLogs, ...SEEDED_CHALLENGE_EXPERIMENT_LOGS]));

  const countsByTool = new Map<string, ChallengeCommunityCounts>();
  for (const item of getChallenges()) {
    countsByTool.set(item.id, emptyCounts());
  }

  for (const reference of references) {
    const current = countsByTool.get(reference.tool_id) ?? emptyCounts();
    current.referenceCount += 1;
    countsByTool.set(reference.tool_id, current);
  }

  for (const comment of comments) {
    const current = countsByTool.get(comment.tool_id) ?? emptyCounts();
    current.commentCount += 1;
    countsByTool.set(comment.tool_id, current);
  }

  for (const log of experimentLogs) {
    const current = countsByTool.get(log.tool_id) ?? emptyCounts();
    current.experimentLogCount += 1;
    countsByTool.set(log.tool_id, current);
  }

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const weeklyReferences = references.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length;
  const weeklyComments = comments.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length;
  const weeklyLogs = experimentLogs.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length;

  return {
    references,
    comments,
    experimentLogs,
    countsByTool,
    totals: {
      references: references.length,
      comments: comments.length,
      experimentLogs: experimentLogs.length,
      weeklyActivity: weeklyReferences + weeklyComments + weeklyLogs,
    },
  };
}

export async function getChallengeBoardPageData() {
  const overview = await getChallengeBoardOverview();

  return {
    ...overview,
    recentReferences: overview.references.slice(0, 6).map((item) => ({
      ...item,
      tool: getChallengeById(item.tool_id),
    })),
    recentComments: overview.comments.slice(0, 8).map((item) => ({
      ...item,
      tool: getChallengeById(item.tool_id),
    })),
    recentExperimentLogs: overview.experimentLogs.slice(0, 8).map((item) => ({
      ...item,
      tool: getChallengeById(item.tool_id),
    })),
  };
}

export async function getChallengeToolPageData(toolId: string) {
  const tool = getChallengeById(toolId);
  if (!tool) return null;

  const supabase = createAdminClient();
  const result = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board", `challenge:${toolId}`])
    .order("created_at", { ascending: false })
    .limit(100);

  if (result.error) {
    console.error(`Failed to fetch challenge board entries for ${toolId}:`, result.error.message);
  }

  const parsed = parseChallengeBoardRows((result.data ?? []) as ChallengeBoardFeedbackRow[]);
  const references = sortByCreatedAtDesc(
    dedupeById([...parsed.references, ...SEEDED_CHALLENGE_REFERENCES.filter((item) => item.tool_id === toolId)])
  );
  const comments = sortByCreatedAtDesc(
    dedupeById([...parsed.comments, ...SEEDED_CHALLENGE_COMMENTS.filter((item) => item.tool_id === toolId)])
  );
  const experimentLogs = sortByCreatedAtDesc(
    dedupeById([...parsed.experimentLogs, ...SEEDED_CHALLENGE_EXPERIMENT_LOGS.filter((item) => item.tool_id === toolId)])
  );

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const allItems = [...references, ...comments, ...experimentLogs];
  const uniqueContributors = new Set(
    allItems.map((item) => item.submitted_name).filter((name): name is string => !!name)
  );
  const weeklyActivityCount = allItems.filter(
    (item) => new Date(item.created_at).getTime() >= sevenDaysAgo
  ).length;

  return {
    tool,
    references,
    comments,
    experimentLogs,
    counts: {
      referenceCount: references.length,
      commentCount: comments.length,
      experimentLogCount: experimentLogs.length,
    },
    uniqueContributorCount: uniqueContributors.size,
    weeklyActivityCount,
  };
}

export function getCommunityCountsForTool(
  countsByTool: Map<string, ChallengeCommunityCounts>,
  toolId: string
): ChallengeCommunityCounts {
  return countsByTool.get(toolId) ?? emptyCounts();
}

export function getTopContributors(
  references: Array<{ submitted_name: string | null; tool_id: string }>,
  comments: Array<{ submitted_name: string | null; tool_id: string }>,
  experimentLogs: Array<{ submitted_name: string | null; tool_id: string }>,
  limit = 5
): Array<{ name: string; count: number; topTool: string; topToolTitle: string }> {
  const counts = new Map<string, { total: number; tools: Map<string, number> }>();

  const items = [...references, ...comments, ...experimentLogs];
  for (const item of items) {
    if (!item.submitted_name) continue;
    const entry = counts.get(item.submitted_name) ?? { total: 0, tools: new Map() };
    entry.total += 1;
    entry.tools.set(item.tool_id, (entry.tools.get(item.tool_id) ?? 0) + 1);
    counts.set(item.submitted_name, entry);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit)
    .map(([name, data]) => {
      const topToolEntry = [...data.tools.entries()].sort((a, b) => b[1] - a[1])[0];
      const topToolId = topToolEntry?.[0] ?? "";
      const tool = getChallengeById(topToolId);
      return { name, count: data.total, topTool: topToolId, topToolTitle: tool?.title ?? topToolId };
    });
}

export function getMostActiveTools(
  countsByTool: Map<string, ChallengeCommunityCounts>,
  limit = 3
): Array<ChallengeItem & ChallengeCommunityCounts> {
  return getChallenges()
    .map((tool) => ({ ...tool, ...(countsByTool.get(tool.id) ?? emptyCounts()) }))
    .sort((a, b) => (b.referenceCount + b.commentCount + b.experimentLogCount * 2) - (a.referenceCount + a.commentCount + a.experimentLogCount * 2))
    .slice(0, limit);
}


export async function getCurrentWeeklyChallenge(): Promise<{
  challenge: WeeklyChallengeRow;
  entries: WeeklyChallengeEntryRow[];
  tool: ChallengeItem | null;
} | null> {
  const weekTag = getSeoulISOWeek();
  const supabase = createAdminClient();

  const challengeResult = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board", "entry:weekly-challenge", `week:${weekTag}`])
    .limit(1)
    .single();

  if (challengeResult.error || !challengeResult.data) return null;

  const row = challengeResult.data as ChallengeBoardFeedbackRow;
  const toolId = getTagValue(row.tags, "challenge:");
  if (!toolId) return null;

  const challenge: WeeklyChallengeRow = {
    id: row.id,
    week_tag: weekTag,
    tool_id: toolId,
    title: row.title,
    description: row.body,
    prompt_hint: row.related_url ?? "",
    created_at: row.created_at,
  };

  const entriesResult = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board", "entry:challenge-entry", `week:${weekTag}`])
    .order("created_at", { ascending: false })
    .limit(50);

  const entries: WeeklyChallengeEntryRow[] = (entriesResult.data ?? []).map((e: ChallengeBoardFeedbackRow) => ({
    id: e.id,
    week_tag: weekTag,
    tool_id: getTagValue(e.tags, "challenge:") ?? toolId,
    body: e.body,
    time_spent: getTagValue(e.tags, "time-spent:"),
    submitted_name: e.submitter_name,
    created_at: e.created_at,
  }));

  return { challenge, entries, tool: getChallengeById(toolId) };
}

export async function getWeeklyChallengeEntries(weekTag: string): Promise<WeeklyChallengeEntryRow[]> {
  const supabase = createAdminClient();
  const result = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board", "entry:challenge-entry", `week:${weekTag}`])
    .order("created_at", { ascending: false })
    .limit(50);

  return (result.data ?? []).map((e: ChallengeBoardFeedbackRow) => ({
    id: e.id,
    week_tag: weekTag,
    tool_id: getTagValue(e.tags, "challenge:") ?? "",
    body: e.body,
    time_spent: getTagValue(e.tags, "time-spent:"),
    submitted_name: e.submitter_name,
    created_at: e.created_at,
  }));
}

export async function getRecentWeeklyChallenges(limit = 4): Promise<WeeklyChallengeRow[]> {
  const supabase = createAdminClient();
  const result = await supabase
    .from("feedback_items")
    .select(FEEDBACK_FIELDS)
    .contains("tags", ["challenge-board", "entry:weekly-challenge"])
    .order("created_at", { ascending: false })
    .limit(limit);

  return (result.data ?? []).map((row: ChallengeBoardFeedbackRow) => ({
    id: row.id,
    week_tag: getTagValue(row.tags, "week:") ?? "",
    tool_id: getTagValue(row.tags, "challenge:") ?? "",
    title: row.title,
    description: row.body,
    prompt_hint: row.related_url ?? "",
    created_at: row.created_at,
  }));
}
