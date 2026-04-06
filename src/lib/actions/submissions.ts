"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSubmission(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const challengeId = formData.get("challenge_id") as string;
  const content = formData.get("content") as string;
  const linkUrl = formData.get("link_url") as string;

  const { error } = await supabase.from("submissions").insert({
    challenge_id: challengeId,
    user_id: user.id,
    content,
    link_url: linkUrl || null,
  });

  if (error) throw error;

  // Award points for submission
  await supabase.from("point_logs").insert({
    user_id: user.id,
    points: 10,
    reason: "submission",
    reference_id: challengeId,
  });

  const { error: rpcError } = await supabase.rpc("increment_user_points", { uid: user.id, pts: 10 });

  if (rpcError) {
    // Fallback: direct SQL update via raw update
    const { data: userData } = await supabase
      .from("users")
      .select("total_points")
      .eq("id", user.id)
      .single();

    if (userData) {
      await supabase
        .from("users")
        .update({ total_points: (userData.total_points ?? 0) + 10 })
        .eq("id", user.id);
    }
  }

  revalidatePath(`/challenges`);
}
