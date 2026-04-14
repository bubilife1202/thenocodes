import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createToken } from "@/lib/auth/api-token";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(120),
  purpose: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
  }

  const { token, hash, prefix } = await createToken();
  const supabase = createAdminClient();

  const { error } = await supabase.from("api_tokens").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    purpose: parsed.data.purpose ?? null,
    token_hash: hash,
    token_prefix: prefix,
  });

  if (error) {
    return NextResponse.json({ error: `Failed to create token: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ token, prefix, message: "키 발급 완료. 이 화면에서만 보여집니다." });
}
