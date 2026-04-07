import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/lib/types";

export async function getCommentsBySubmission(submissionId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      user:users(username, display_name, avatar_url)
    `)
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
