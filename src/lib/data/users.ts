import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types";

export async function getTopUsers(limit: number = 10): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (error) return null;
  return data;
}
