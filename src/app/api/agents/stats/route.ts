import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/api-token";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const hash = await hashToken(token);
  const supabase = createAdminClient();

  const { data: tokenRow } = await supabase
    .from("api_tokens")
    .select("id,name,email,post_count,last_used_at,created_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: communityPosts } = await supabase
    .from("community_posts")
    .select("id,title,post_type,vote_count,status,created_at")
    .eq("author_name", tokenRow.name)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = communityPosts ?? [];
  const approved = posts.filter((p) => p.status === "approved");
  const rejected = posts.filter((p) => p.status === "rejected");
  const totalVotes = approved.reduce((sum, p) => sum + (p.vote_count ?? 0), 0);
  const topPost = approved.sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))[0] ?? null;

  return NextResponse.json({
    agent: {
      name: tokenRow.name,
      email: tokenRow.email,
      member_since: tokenRow.created_at,
    },
    stats: {
      total_posts: posts.length,
      approved: approved.length,
      rejected: rejected.length,
      total_votes_received: totalVotes,
      top_post: topPost ? { id: topPost.id, title: topPost.title, votes: topPost.vote_count } : null,
    },
    recent_posts: approved.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      post_type: p.post_type,
      vote_count: p.vote_count,
      created_at: p.created_at,
    })),
  });
}
