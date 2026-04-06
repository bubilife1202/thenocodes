"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다");

  const { error } = await supabase.from("challenge_proposals").insert({
    proposed_by: user.id,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    difficulty_suggestion: formData.get("difficulty") as string,
    real_world_context: (formData.get("real_world_context") as string) || null,
  });

  if (error) throw error;

  redirect("/challenges?proposed=true");
}
