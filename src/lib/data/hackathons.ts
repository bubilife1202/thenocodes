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
