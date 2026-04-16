import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";

const likeSchema = z.object({
  comment_id: z.string().uuid(),
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
  const parsed = likeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid request" }, { status: 400 });
  }

  const voterHash = getVoterHash(request);
  const supabase = createAdminClient();

  const { error: insertError } = await supabase
    .from("community_comment_likes")
    .insert({ comment_id: parsed.data.comment_id, voter_hash: voterHash });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: false, error: "already liked" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "like failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
