"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return currentUser?.role === "admin";
}

export async function toggleFeatured(submissionId: string, challengeSlug: string) {
  if (!(await checkAdmin())) throw new Error("운영진 전용 기능입니다");

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("submissions")
    .select("is_featured")
    .eq("id", submissionId)
    .single();

  const { error } = await supabase
    .from("submissions")
    .update({ is_featured: !current?.is_featured })
    .eq("id", submissionId);

  if (error) throw error;
  revalidatePath(`/challenges/${challengeSlug}`);
}

export async function hideSubmission(submissionId: string, challengeSlug: string) {
  if (!(await checkAdmin())) throw new Error("운영진 전용 기능입니다");

  const supabase = await createClient();
  // 실무적으로는 is_hidden 컬럼을 추가하거나, 상태를 'deleted'로 바꾸는 것이 좋으나
  // 현재는 즉시 삭제하거나 featured를 취소하는 식으로 우선 구현 가능.
  // 여기서는 실제 삭제(Hard Delete) 대신, 운영진이 '숨김' 처리를 할 수 있는 
  // 로직을 위해 'is_featured'를 활용하거나 추후 컬럼 추가를 권장합니다.
  
  // 임시로 삭제 처리 (운영진의 방해꾼 제거 기능)
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);

  if (error) throw error;
  revalidatePath(`/challenges/${challengeSlug}`);
}
