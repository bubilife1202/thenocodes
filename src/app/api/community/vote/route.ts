import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";

const voteSchema = z.object({
  post_id: z.string().uuid(),
});

function getVoterHash(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("cf-connecting-ip")
    ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "";
  return createHash("sha256").update(`${ip}:${ua}`).digest("hex").slice(0, 32);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const voterHash = getVoterHash(request);
  const supabase = createAdminClient();

  const { error: insertError } = await supabase
    .from("community_votes")
    .insert({ post_id: parsed.data.post_id, voter_hash: voterHash });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: false, error: "already voted" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "vote failed" }, { status: 500 });
  }

  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select("vote_count")
    .eq("id", parsed.data.post_id)
    .maybeSingle();

  if (postError) {
    console.error("Failed to read updated vote count:", postError.message);
  }

  return NextResponse.json({ ok: true, vote_count: post?.vote_count ?? null });
}
