import { createClient } from "@/lib/supabase/server";
import {
  getHackathonStatus,
  isKoreanHackathon,
  sortHackathons,
  type HackathonStatus,
} from "@/lib/hackathons";

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
  category: string;
}

export async function getHackathons(filter?: HackathonStatus) {
  const supabase = await createClient();
  const now = new Date();

  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .limit(200);

  if (error) {
    console.error("Failed to fetch hackathons:", error.message);
    return [];
  }

  const rows = ((data ?? []) as HackathonRow[]).filter(isKoreanHackathon);
  const hackathonRows = rows.filter((row) => row.category !== "contest");
  const filteredRows = filter
    ? hackathonRows.filter((row) => getHackathonStatus(row, now) === filter)
    : hackathonRows.filter((row) => getHackathonStatus(row, now) !== "ended");

  return sortHackathons(filteredRows, now, filter);
}

export async function getDeadlineSoon(days = 7): Promise<HackathonRow[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() + days * 86400000).toISOString();

  const { data } = await supabase
    .from("hackathons")
    .select("*")
    .gte("ends_at", now)
    .lte("ends_at", cutoff)
    .order("ends_at", { ascending: true })
    .limit(6);

  return ((data ?? []) as HackathonRow[]).filter(isKoreanHackathon);
}

export async function getStats() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { count: hackathonCount } = await supabase
    .from("hackathons")
    .select("*", { count: "exact", head: true })
    .neq("category", "contest")
    .gte("ends_at", now);

  const { count: contestCount } = await supabase
    .from("hackathons")
    .select("*", { count: "exact", head: true })
    .eq("category", "contest")
    .gte("ends_at", now);

  return {
    hackathons: hackathonCount ?? 0,
    contests: contestCount ?? 0,
  };
}

export async function getContests(filter?: HackathonStatus) {
  const supabase = await createClient();
  const now = new Date();

  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("category", "contest")
    .limit(200);

  if (error) {
    console.error("Failed to fetch contests:", error.message);
    return [];
  }

  const rows = (data ?? []) as HackathonRow[];
  const filteredRows = filter
    ? rows.filter((row) => getHackathonStatus(row, now) === filter)
    : rows.filter((row) => getHackathonStatus(row, now) !== "ended");

  return sortHackathons(filteredRows, now, filter);
}
