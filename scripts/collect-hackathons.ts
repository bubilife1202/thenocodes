import { createClient } from "@supabase/supabase-js";
import { collectDevpost } from "./collectors/devpost.js";
import { collectKaggle } from "./collectors/kaggle.js";
import { collectDacon } from "./collectors/dacon.js";
import { collectLablab } from "./collectors/lablab.js";
import { collectHackerEarth } from "./collectors/hackerearth.js";
import { collectEventUs } from "./collectors/eventus.js";
import { collectLuma } from "./collectors/luma.js";
import { collectFesta } from "./collectors/festa.js";
import type { Hackathon } from "./collectors/types.js";
import { isKoreanHackathon } from "../src/lib/hackathons.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upsertEvents(events: Hackathon[]) {
  if (events.length === 0) return;

  const { error } = await supabase.from("hackathons").upsert(
    events.map((h) => ({
      ...h,
      collected_at: new Date().toISOString(),
    })),
    { onConflict: "source,external_id" }
  );

  if (error) {
    console.error("Upsert error:", error.message);
  } else {
    console.log(`Upserted ${events.length} events`);
  }
}

async function main() {
  console.log("=== Event Collection Started ===");
  console.log(new Date().toISOString());

  // 해커톤/공모전 수집
  const hackathonCollectors = [
    collectDevpost,
    collectKaggle,
    collectDacon,
    collectLablab,
    collectHackerEarth,
    collectEventUs,
  ];

  // 밋업 수집
  const meetupCollectors = [
    collectLuma,
    collectFesta,
  ];

  // 전부 병렬 실행
  const allCollectors = [...hackathonCollectors, ...meetupCollectors];
  const results = await Promise.allSettled(allCollectors.map((c) => c()));

  const hackathons: Hackathon[] = [];
  const meetups: Hackathon[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      if (i < hackathonCollectors.length) {
        hackathons.push(...result.value);
      } else {
        meetups.push(...result.value);
      }
    } else {
      console.error(`Collector ${i} failed:`, result.reason);
    }
  });

  // 해커톤/공모전: 한국 필터 적용
  console.log(`\nHackathons total: ${hackathons.length}`);
  const koreanHackathons = hackathons.filter(isKoreanHackathon);
  console.log(`Korean-only kept: ${koreanHackathons.length}`);
  await upsertEvents(koreanHackathons);

  // 밋업: 이미 서울/한국 기반으로 수집했으므로 추가 필터 불필요
  console.log(`\nMeetups total: ${meetups.length}`);
  await upsertEvents(meetups);

  console.log("\n=== Done ===");
}

main().catch(console.error);
