import { createClient } from "@supabase/supabase-js";
import { getChallenges } from "../src/lib/data/challenges";
import { getSeoulISOWeek } from "../src/lib/utils/date";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function parseArgs(args: string[]) {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const toolId = args.tool;
  const scenario = args.scenario || "";
  const prompt = args.prompt || "";
  const week = args.week || getSeoulISOWeek();
  const force = args.force === "true";

  if (!toolId) {
    console.error("--tool is required. Available tools:");
    getChallenges().forEach((t) => console.error(`  ${t.id} — ${t.title}`));
    process.exit(1);
  }

  const tool = getChallenges().find((t) => t.id === toolId);
  if (!tool) {
    console.error(`Tool "${toolId}" not found. Available tools:`);
    getChallenges().forEach((t) => console.error(`  ${t.id} — ${t.title}`));
    process.exit(1);
  }

  if (!scenario) {
    console.error("--scenario is required (e.g., '주간보고 요약 도전')");
    process.exit(1);
  }

  // Check for existing challenge this week
  const existing = await supabase
    .from("feedback_items")
    .select("id,title")
    .contains("tags", [
      "challenge-board",
      "entry:weekly-challenge",
      `week:${week}`,
    ])
    .limit(1);

  if (existing.data && existing.data.length > 0) {
    if (!force) {
      console.error(
        `Challenge already exists for ${week}: "${existing.data[0].title}"`
      );
      console.error("Use --force to overwrite.");
      process.exit(1);
    }
    console.log(`Overwriting existing challenge for ${week}`);
  }

  const title = scenario;
  const description =
    prompt || `${tool.title}로 "${scenario}" 시나리오를 실험해보세요.`;

  const recipe = tool.recipes[0];
  const promptHint = prompt || recipe?.prompt || "";

  const { error } = await supabase.from("feedback_items").insert({
    title,
    body: description,
    kind: "content",
    status: "queued",
    priority: "high",
    source: "operator",
    submitter_name: "더노코즈 운영",
    related_url: promptHint,
    is_public: false,
    tags: [
      "challenge-board",
      "entry:weekly-challenge",
      `week:${week}`,
      `challenge:${toolId}`,
    ],
  });

  if (error) {
    console.error("Failed to create weekly challenge:", error.message);
    process.exit(1);
  }

  console.log(`Weekly challenge created for ${week}:`);
  console.log(`  Tool: ${tool.title} (${toolId})`);
  console.log(`  Scenario: ${scenario}`);
  console.log(`  Prompt: ${promptHint.slice(0, 80)}...`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
