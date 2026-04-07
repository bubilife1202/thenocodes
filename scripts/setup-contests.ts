import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Extract project ref from URL
const projectRef = supabaseUrl.replace("https://", "").split(".")[0];

async function addCategoryColumn() {
  const sql = `ALTER TABLE public.hackathons ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'hackathon';`;

  // Use Supabase Management API to run SQL
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (res.ok) {
    console.log("Category column added (or already exists)");
  } else {
    const text = await res.text();
    console.log(`Management API (${res.status}):`, text);
    // Try alternative: just insert with category and see if it works
    console.log("Will attempt insert to check if column exists...");
  }
}

async function seedContests() {
  const contests = [
    {
      source: "kef",
      external_id: "kef-youth-entrepreneur-15",
      title: "제15회 청년기업가대회",
      description:
        "청년 창업가들의 스타트업 아이디어를 평가하는 창업 경진대회. AI 취업 플랫폼, 나노 소재, 식품위생 솔루션 등 다양한 분야의 팀이 참가.",
      organizer: "한국기업가정신재단",
      url: "https://www.kef.kr/contest/entry",
      thumbnail_url: null,
      prize: null,
      tags: ["창업", "스타트업", "경진대회", "청년"],
      starts_at: "2026-03-01T00:00:00Z",
      ends_at: "2026-06-30T23:59:59Z",
      location: "대한민국",
      category: "contest",
      collected_at: new Date().toISOString(),
    },
  ];

  const { error } = await supabase
    .from("hackathons")
    .upsert(contests, { onConflict: "source,external_id" });

  if (error) {
    if (error.message.includes("category")) {
      console.log("Category column doesn't exist yet, inserting without it...");
      const withoutCategory = contests.map(({ category, ...rest }) => rest);
      const { error: err2 } = await supabase
        .from("hackathons")
        .upsert(withoutCategory, { onConflict: "source,external_id" });
      if (err2) console.error("Upsert error:", err2.message);
      else console.log("Upserted contest(s) without category column");
    } else {
      console.error("Upsert error:", error.message);
    }
  } else {
    console.log(`Upserted ${contests.length} contest(s) with category`);
  }
}

async function main() {
  console.log("=== Setting up Contests ===");
  await addCategoryColumn();
  await seedContests();
  console.log("=== Done ===");
}

main().catch(console.error);
