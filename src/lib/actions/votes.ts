"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleVote(submissionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  // Check if vote exists
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    // Remove vote
    await supabase.from("votes").delete().eq("id", existingVote.id);
  } else {
    // Add vote (trigger handles vote_count + points)
    await supabase.from("votes").insert({
      submission_id: submissionId,
      user_id: user.id,
    });
  }

  revalidatePath("/challenges");
}
