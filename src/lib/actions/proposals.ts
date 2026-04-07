"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const proposalSchema = z.object({
  title: z.string().min(5, "제목은 최소 5자 이상이어야 합니다").max(100, "제목은 100자를 초과할 수 없습니다"),
  description: z.string().min(20, "설명은 최소 20자 이상이어야 합니다").max(3000, "설명은 3000자를 초과할 수 없습니다"),
  category: z.enum(["ai_automation", "data", "nocode", "prompt", "project"], {
    error: "유효한 카테고리를 선택해주세요",
  }),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    error: "유효한 난이도를 선택해주세요",
  }),
  real_world_context: z.string().max(2000, "실전 배경은 2000자를 초과할 수 없습니다").or(z.literal("")).optional(),
});

export async function createProposal(_prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = proposalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    difficulty: formData.get("difficulty"),
    real_world_context: formData.get("real_world_context") || "",
  });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message);
    return { error: messages.join(", ") };
  }

  const { error } = await supabase.from("challenge_proposals").insert({
    proposed_by: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    difficulty_suggestion: parsed.data.difficulty,
    real_world_context: parsed.data.real_world_context || null,
  });

  if (error) {
    return { error: "제안 등록에 실패했습니다. 다시 시도해주세요." };
  }

  redirect("/challenges?proposed=true");
}
