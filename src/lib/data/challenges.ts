import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/lib/types";

export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "active")
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getAllChallenges(status?: string, category?: string): Promise<Challenge[]> {
  const supabase = await createClient();
  let query = supabase
    .from("challenges")
    .select("*")
    .in("status", ["active", "closed"])
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = supabase
      .from("challenges")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
