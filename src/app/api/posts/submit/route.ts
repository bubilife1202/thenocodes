import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/api-token";

const postSchema = z.object({
  board: z.enum(["signals", "openclaw", "reviews", "community"]),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(5000),
  source_url: z.string().trim().url().optional(),
  // signals/openclaw specific
  signal_type: z.enum(["platform_launch", "api_tool", "open_model", "policy", "research"]).optional(),
  summary: z.string().trim().max(500).optional(),
  action_point: z.string().trim().max(500).optional(),
  source_name: z.string().trim().max(80).optional(),
  tags: z.array(z.string().trim()).max(10).optional(),
  // openclaw category
  openclaw_category: z.enum(["official", "news", "community", "case"]).optional(),
  // reviews specific
  review_category: z.enum(["tool", "hackathon", "course", "support", "etc"]).optional(),
  related_url: z.string().trim().url().optional(),
  // community specific
  post_type: z.enum(["used_it", "found_it", "question"]).optional(),
  author_name: z.string().trim().max(40).optional(),
  link_url: z.string().trim().url().optional(),
}).refine(
  (data) => data.board !== "community" || data.post_type !== "found_it" || (data.link_url && data.link_url.length > 0),
  { message: "found_it posts require link_url", path: ["link_url"] },
);

async function notifySlack(params: { board: string; title: string; author: string; feedbackId?: string; url?: string }) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  const text = `*[API 제출] ${params.board}* · ${params.author}\n${params.title}${params.url ? `\n${params.url}` : ""}`;
  try {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "C0AS5JSTU4R", text }),
    });
  } catch {
    // ignore
  }
}

export async function POST(request: Request) {
  // 1. Auth
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }
  const token = authHeader.slice("Bearer ".length).trim();
  const hash = await hashToken(token);

  const supabase = createAdminClient();
  const { data: tokenRow } = await supabase
    .from("api_tokens")
    .select("id,name,email,revoked_at,post_count")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!tokenRow || tokenRow.revoked_at) {
    return NextResponse.json({ error: "Invalid or revoked token" }, { status: 401 });
  }

  // Rate limit: 50 posts per rolling 24h window
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count: recentCount } = await supabase
    .from("community_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_name", tokenRow.name)
    .gte("created_at", since);
  const { count: signalCount } = await supabase
    .from("builder_signals")
    .select("id", { count: "exact", head: true })
    .eq("source_name", tokenRow.name)
    .gte("created_at", since);
  if (((recentCount ?? 0) + (signalCount ?? 0)) >= 50) {
    return NextResponse.json({ error: "Daily rate limit exceeded (50/day)" }, { status: 429 });
  }

  // 2. Validate body
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
  }

  const values = parsed.data;
  let insertedId: string | undefined;
  let postUrl: string | undefined;

  // 3. Route by board
  if (values.board === "signals" || values.board === "openclaw") {
    // Both go to builder_signals, openclaw has extra tag
    const slug = values.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
    const tags = [...(values.tags ?? [])];
    if (values.board === "openclaw") {
      tags.push("openclaw");
      if (values.openclaw_category) tags.push(`openclaw-${values.openclaw_category}`);
    }

    const { data: inserted, error } = await supabase.from("builder_signals").insert({
      slug,
      title: values.title,
      summary: values.summary ?? values.body.slice(0, 300),
      action_point: values.action_point ?? "",
      source_url: values.source_url ?? "",
      source_name: values.source_name ?? tokenRow.name,
      signal_type: values.signal_type ?? "api_tool",
      tags,
      published_at: new Date().toISOString(),
      is_featured: false,
    }).select("id").single();

    if (error || !inserted) {
      return NextResponse.json({ error: `Failed to insert: ${error?.message}` }, { status: 500 });
    }
    insertedId = inserted.id;
    postUrl = `https://thenocodes.org/${values.board === "openclaw" ? "openclaw" : `signals/${slug}`}`;
  } else if (values.board === "community") {
    const pt = values.post_type ?? "found_it";
    const { data: inserted, error } = await supabase.from("community_posts").insert({
      post_type: pt,
      title: values.title,
      body: values.body,
      link_url: values.link_url ?? values.source_url ?? null,
      author_name: values.author_name ?? tokenRow.name,
      status: "approved",
    }).select("id").single();

    if (error || !inserted) {
      return NextResponse.json({ error: `Failed to insert: ${error?.message}` }, { status: 500 });
    }
    insertedId = inserted.id;
    postUrl = `https://thenocodes.org/community`;
  } else if (values.board === "reviews") {
    const cat = values.review_category ?? "etc";
    const { data: inserted, error } = await supabase.from("feedback_items").insert({
      title: values.title,
      body: values.body,
      kind: "content",
      status: "queued",
      priority: "medium",
      source: "api",
      submitter_name: tokenRow.name,
      related_url: values.related_url ?? null,
      is_public: false,
      tags: ["review", `category:${cat}`, "source:api"],
    }).select("id").single();

    if (error || !inserted) {
      return NextResponse.json({ error: `Failed to insert: ${error?.message}` }, { status: 500 });
    }
    insertedId = inserted.id;
    postUrl = `https://thenocodes.org/reviews`;
  }

  // 4. Update token usage
  await supabase.from("api_tokens").update({
    last_used_at: new Date().toISOString(),
    post_count: (tokenRow.post_count ?? 0) + 1,
  }).eq("id", tokenRow.id);

  // 5. Slack notify
  await notifySlack({
    board: values.board,
    title: values.title,
    author: tokenRow.name,
    feedbackId: insertedId,
    url: postUrl,
  });

  return NextResponse.json({ ok: true, id: insertedId, url: postUrl });
}
