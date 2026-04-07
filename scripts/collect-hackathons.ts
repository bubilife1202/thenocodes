import { createClient } from "@supabase/supabase-js";
import { collectDevpost } from "./collectors/devpost.js";
import { collectKaggle } from "./collectors/kaggle.js";
import { collectDacon } from "./collectors/dacon.js";
import { collectLablab } from "./collectors/lablab.js";
import { collectHackerEarth } from "./collectors/hackerearth.js";
import { collectEventUs } from "./collectors/eventus.js";
import type { Hackathon } from "./collectors/types.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upsertHackathons(hackathons: Hackathon[]) {
  if (hackathons.length === 0) return;

  const { error } = await supabase.from("hackathons").upsert(
    hackathons.map((h) => ({
      ...h,
      collected_at: new Date().toISOString(),
    })),
    { onConflict: "source,external_id" }
  );

  if (error) {
    console.error("Upsert error:", error.message);
  } else {
    console.log(`Upserted ${hackathons.length} hackathons`);
  }
}

async function main() {
  console.log("=== Hackathon Collection Started ===");
  console.log(new Date().toISOString());

  const collectors = [
    collectDevpost,
    collectKaggle,
    collectDacon,
    collectLablab,
    collectHackerEarth,
    collectEventUs,
  ];

  const results = await Promise.allSettled(collectors.map((c) => c()));

  const all: Hackathon[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    } else {
      console.error("Collector failed:", result.reason);
    }
  }

  console.log(`Total collected: ${all.length}`);
  await upsertHackathons(all);

  console.log("=== Done ===");
}

main().catch(console.error);
