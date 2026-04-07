"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const submissionSchema = z.object({
  challenge_id: z.string().uuid("유효하지 않은 챌린지 ID입니다"),
  content: z.string().min(10, "내용은 최소 10자 이상이어야 합니다").max(5000, "내용은 5000자를 초과할 수 없습니다"),
  link_url: z.string().url("유효한 URL을 입력해주세요").or(z.literal("")).optional(),
});

export async function createSubmission(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = submissionSchema.safeParse({
    challenge_id: formData.get("challenge_id"),
    content: formData.get("content"),
    link_url: formData.get("link_url") || "",
  });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message);
    return { error: messages.join(", ") };
  }

  // Verify challenge exists and is active
  const { data: challenge } = await supabase
    .from("challenges")
    .select("id, status")
    .eq("id", parsed.data.challenge_id)
    .single();

  if (!challenge || challenge.status !== "active") {
    return { error: "참여할 수 없는 챌린지입니다" };
  }

  // Insert with DB unique constraint as the real guard against duplicates
  const { error } = await supabase.from("submissions").insert({
    challenge_id: parsed.data.challenge_id,
    user_id: user.id,
    content: parsed.data.content,
    link_url: parsed.data.link_url || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 이 챌린지에 제출하셨습니다" };
    }
    return { error: "제출에 실패했습니다. 다시 시도해주세요." };
  }

  // Award points atomically via DB function (validates caller = uid, prevents duplicates)
  const { error: pointError } = await supabase.rpc("award_submission_points", {
    uid: user.id,
    pts: 10,
    ref_id: parsed.data.challenge_id,
  });

  if (pointError) {
    // Submission succeeded but points failed — log but don't fail the user
    console.error("Point award failed:", pointError.message);
  }

  revalidatePath(`/challenges`);
  return { success: true };
}
