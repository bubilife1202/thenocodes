import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";

export async function getSubmissionsByChallenge(challengeId: string): Promise<Submission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(`
      *,
      user:users(username, display_name, avatar_url)
    `)
    .eq("challenge_id", challengeId)
    .order("vote_count", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
