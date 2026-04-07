import { createClient } from "@/lib/supabase/server";

export type HackathonStatus = "upcoming" | "active" | "ended";

export interface HackathonRow {
  id: string;
  source: string;
  external_id: string;
  title: string;
  description: string | null;
  organizer: string | null;
  url: string;
  thumbnail_url: string | null;
  prize: string | null;
  tags: string[];
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  collected_at: string;
}

export function getHackathonStatus(h: HackathonRow): HackathonStatus {
  const now = new Date();
  if (h.starts_at && new Date(h.starts_at) > now) return "upcoming";
  if (h.ends_at && new Date(h.ends_at) < now) return "ended";
  return "active";
}

export async function getHackathons(filter?: HackathonStatus) {
  const supabase = await createClient();

  let query = supabase
    .from("hackathons")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const now = new Date().toISOString();

  if (filter === "upcoming") {
    query = query.gt("starts_at", now);
  } else if (filter === "active") {
    query = query.lte("starts_at", now).gte("ends_at", now);
  } else if (filter === "ended") {
    query = query.lt("ends_at", now);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error("Failed to fetch hackathons:", error.message);
    return [];
  }

  return (data ?? []) as HackathonRow[];
}
