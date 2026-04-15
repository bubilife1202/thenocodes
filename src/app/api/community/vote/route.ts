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

  const { data: existing } = await supabase
    .from("community_votes")
    .select("id")
    .eq("post_id", parsed.data.post_id)
    .eq("voter_hash", voterHash)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: false, error: "already voted" }, { status: 409 });
  }

  const { error: voteError } = await supabase
    .from("community_votes")
    .insert({ post_id: parsed.data.post_id, voter_hash: voterHash });

  if (voteError) {
    return NextResponse.json({ ok: false, error: "vote failed" }, { status: 500 });
  }

  const { error: rpcError } = await supabase.rpc("increment_community_vote", {
    post_id: parsed.data.post_id,
  });

  if (rpcError) {
    console.error("Failed to increment vote:", rpcError.message);
  }

  return NextResponse.json({ ok: true });
}
