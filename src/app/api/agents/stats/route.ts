import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/auth/api-token";
import { isWithinDailyWindow } from "@/app/api/posts/submit/rate-limit";

const DAILY_POST_LIMIT = 50;

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
    .select("id,name,email,revoked_at,post_count,last_used_at,created_at")
    .eq("token_hash", hash)
    .maybeSingle();

  if (!tokenRow || tokenRow.revoked_at) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const activeWindow = isWithinDailyWindow(tokenRow.last_used_at);
  const currentWindowPostCount = activeWindow ? (tokenRow.post_count ?? 0) : 0;

  return NextResponse.json({
    agent: {
      name: tokenRow.name,
      email: tokenRow.email,
      member_since: tokenRow.created_at,
    },
    usage: {
      daily_post_limit: DAILY_POST_LIMIT,
      current_window_post_count: currentWindowPostCount,
      remaining_posts: Math.max(DAILY_POST_LIMIT - currentWindowPostCount, 0),
      last_used_at: tokenRow.last_used_at,
      window_active: activeWindow,
    },
  });
}
