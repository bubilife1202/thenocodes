"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const submissionId = formData.get("submission_id") as string;
  const challengeSlug = formData.get("challenge_slug") as string;
  const content = formData.get("content") as string;

  if (!content.trim()) return;

  const { error } = await supabase.from("comments").insert({
    submission_id: submissionId,
    user_id: user.id,
    content,
  });

  if (error) throw error;

  // Synergy Point: +1 for commenting
  await supabase.from("point_logs").insert({
    user_id: user.id,
    points: 1,
    reason: "comment_written",
    reference_id: submissionId,
  });

  // Simple point update
  const { data: userData } = await supabase
    .from("users")
    .select("total_points")
    .eq("id", user.id)
    .single();

  if (userData) {
    await supabase
      .from("users")
      .update({ total_points: (userData.total_points ?? 0) + 1 })
      .eq("id", user.id);
  }

  revalidatePath(`/challenges/${challengeSlug}`);
}

export async function deleteComment(id: string, challengeSlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("권한이 없습니다");

  // Check if owner or admin
  const { data: comment } = await supabase.from("comments").select("user_id").eq("id", id).single();
  const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (comment?.user_id !== user.id && currentUser?.role !== "admin") {
    throw new Error("권한이 없습니다");
  }

  await supabase.from("comments").delete().eq("id", id);
  revalidatePath(`/challenges/${challengeSlug}`);
}
