/**
 * 흐름(Signal) 추가 스크립트
 *
 * 사용법: echo '<JSON>' | npx tsx scripts/add-signal.ts
 *
 * JSON 형식:
 * {
 *   "title": "Claude Managed Agents 런칭",
 *   "summary": "요약 2-3문장",
 *   "action_point": "빌더가 당장 해볼 것",
 *   "source_url": "https://...",
 *   "source_name": "Anthropic",
 *   "signal_type": "platform_launch",
 *   "tags": ["AI", "Agent"],
 *   "published_at": "2026-04-08"
 * }
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Run with: source thenocodes-secrets/env.local && echo '<json>' | npx tsx scripts/add-signal.ts");
  process.exit(1);
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function main() {
  // stdin에서 JSON 읽기
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = JSON.parse(Buffer.concat(chunks).toString("utf-8"));

  const signal = {
    slug: input.slug || toSlug(input.title),
    title: input.title,
    summary: input.summary,
    action_point: input.action_point,
    source_url: input.source_url,
    source_name: input.source_name || null,
    signal_type: input.signal_type,
    tags: input.tags || [],
    published_at: input.published_at || new Date().toISOString(),
    is_featured: input.is_featured ?? true,
  };

  console.log("Adding signal:", signal.title);
  console.log("Slug:", signal.slug);
  console.log("Type:", signal.signal_type);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("builder_signals")
    .upsert(signal, { onConflict: "slug" })
    .select("id, slug, title")
    .single();

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log("✅ Signal added:", data.title);
  console.log("   URL: https://thenocodes.org/signals");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
