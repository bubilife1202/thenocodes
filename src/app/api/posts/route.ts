import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const board = url.searchParams.get("board") ?? "community";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const type = url.searchParams.get("type");

  const supabase = createAdminClient();

  if (board === "community") {
    let query = supabase
      .from("community_posts")
      .select("id,post_type,title,body,link_url,author_name,vote_count,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq("post_type", type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ board, posts: data, count: data?.length ?? 0 });
  }

  if (board === "signals") {
    let query = supabase
      .from("builder_signals")
      .select("id,slug,title,summary,action_point,source_url,source_name,signal_type,tags,published_at")
      .not("tags", "ov", "{openclaw}")
      .not("tags", "ov", "{hermes-agent}")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq("signal_type", type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ board, posts: data, count: data?.length ?? 0 });
  }

  return NextResponse.json({ error: "Invalid board. Use: community, signals" }, { status: 400 });
}
