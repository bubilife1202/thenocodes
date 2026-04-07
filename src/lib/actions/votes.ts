"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const voteSchema = z.object({
  submissionId: z.string().uuid("유효하지 않은 제출 ID입니다"),
});

export async function toggleVote(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = voteSchema.safeParse({ submissionId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify submission exists
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, user_id")
    .eq("id", parsed.data.submissionId)
    .single();

  if (!submission) {
    return { error: "존재하지 않는 제출입니다" };
  }

  // Prevent self-voting
  if (submission.user_id === user.id) {
    return { error: "자신의 제출에는 투표할 수 없습니다" };
  }

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("submission_id", parsed.data.submissionId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    const { error } = await supabase.from("votes").delete().eq("id", existingVote.id);
    if (error) return { error: "투표 취소에 실패했습니다" };
  } else {
    const { error } = await supabase.from("votes").insert({
      submission_id: parsed.data.submissionId,
      user_id: user.id,
    });
    if (error) return { error: "투표에 실패했습니다" };
  }

  revalidatePath("/challenges");
  return { success: true };
}
