import { createClient } from "@supabase/supabase-js";
import {
  SEEDED_CHALLENGE_COMMENTS,
  SEEDED_CHALLENGE_EXPERIMENT_LOGS,
  SEEDED_CHALLENGE_REFERENCES,
} from "../src/lib/data/challenge-board-seed";
import { getChallenges } from "../src/lib/data/challenges";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const existing = await supabase
    .from("feedback_items")
    .select("id,title,related_url,tags")
    .contains("tags", ["challenge-board"])
    .limit(500);

  if (existing.error) {
    throw new Error(`Failed to load existing challenge-board entries: ${existing.error.message}`);
  }

  const existingKeys = new Set(
    (existing.data ?? []).map((item) => `${item.title}::${item.related_url ?? ""}::${(item.tags ?? []).join("|")}`)
  );

  const toolMap = new Map(getChallenges().map((tool) => [tool.id, tool.title]));

  const referenceRows = SEEDED_CHALLENGE_REFERENCES.map((item) => ({
    title: item.title,
    body: item.note ?? `${toolMap.get(item.tool_id) ?? item.tool_id} 시작용 레퍼런스`,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "operator",
    submitter_name: item.submitted_name,
    related_url: item.url,
    is_public: false,
    created_at: item.created_at,
    updated_at: item.created_at,
    tags: ["challenge-board", `challenge:${item.tool_id}`, "entry:reference", "seeded"],
  }));

  const commentRows = SEEDED_CHALLENGE_COMMENTS.map((item) => ({
    title: `${toolMap.get(item.tool_id) ?? item.tool_id} 코멘트`,
    body: item.body,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "operator",
    submitter_name: item.submitted_name,
    is_public: false,
    created_at: item.created_at,
    updated_at: item.created_at,
    tags: ["challenge-board", `challenge:${item.tool_id}`, "entry:comment", "seeded"],
  }));

  const experimentLogRows = SEEDED_CHALLENGE_EXPERIMENT_LOGS.map((item) => ({
    title: `${toolMap.get(item.tool_id) ?? item.tool_id} 실험 로그`,
    body: item.body,
    kind: "content",
    status: "queued",
    priority: "medium",
    source: "operator",
    submitter_name: item.submitted_name,
    is_public: false,
    created_at: item.created_at,
    updated_at: item.created_at,
    tags: [
      "challenge-board",
      `challenge:${item.tool_id}`,
      "entry:experiment-log",
      ...(item.time_spent ? [`time-spent:${item.time_spent}`] : []),
      ...(item.scenario ? [`scenario:${item.scenario}`] : []),
      "seeded",
    ],
  }));

  const rows = [...referenceRows, ...commentRows, ...experimentLogRows].filter((item) => {
    const key = `${item.title}::${item.related_url ?? ""}::${item.tags.join("|")}`;
    return !existingKeys.has(key);
  });

  if (rows.length === 0) {
    console.log("No new challenge-board seed rows to insert.");
    return;
  }

  const inserted = await supabase.from("feedback_items").insert(rows);
  if (inserted.error) {
    throw new Error(`Failed to insert challenge-board seed rows: ${inserted.error.message}`);
  }

  console.log(`Inserted ${rows.length} challenge-board seed rows.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
