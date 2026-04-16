import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/api-token";

const commentSchema = z.object({
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  body: z.string().trim().min(2).max(1000),
  author_name: z.string().trim().max(40).optional(),
});

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const postId = url.searchParams.get("post_id");

  if (!postId || !uuidRegex.test(postId)) {
    return NextResponse.json({ error: "valid post_id (UUID) required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_comments")
    .select("id,post_id,parent_id,body,author_name,like_count,source,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }

  return NextResponse.json({ comments: data, count: data?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const hash = await hashToken(token);
  const supabase = createAdminClient();

  const { data: tokenRow } = await supabase
    .from("api_tokens")
    .select("id,name,revoked_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!tokenRow || tokenRow.revoked_at) {
    return NextResponse.json({ error: "Invalid or revoked token" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
  }

  const values = parsed.data;

  const { data: inserted, error } = await supabase.from("community_comments").insert({
    post_id: values.post_id,
    parent_id: values.parent_id ?? null,
    body: values.body,
    author_name: values.author_name ?? tokenRow.name,
    source: "api",
  }).select("id").single();

  if (error || !inserted) {
    return NextResponse.json({ error: "Failed to insert comment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: inserted.id });
}
