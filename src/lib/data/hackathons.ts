import { createClient } from "@/lib/supabase/server";
import {
  getHackathonStatus,
  isKoreanHackathon,
  sortHackathons,
  type HackathonStatus,
} from "@/lib/hackathons";

const FIELDS = "id,source,external_id,title,description,organizer,url,prize,tags,starts_at,ends_at,location,collected_at,category" as const;

export interface HackathonRow {
  id: string;
  source: string;
  external_id: string;
  title: string;
  description: string | null;
  organizer: string | null;
  url: string;
  thumbnail_url?: string | null;
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

  let query = supabase
    .from("hackathons")
    .select(FIELDS)
    .neq("category", "contest")
    .limit(200);

  if (!filter || filter !== "ended") {
    query = query.gte("ends_at", now.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch hackathons:", error.message);
    return [];
  }

  const rows = ((data ?? []) as HackathonRow[]).filter(isKoreanHackathon);
  const filteredRows = filter
    ? rows.filter((row) => getHackathonStatus(row, now) === filter)
    : rows;

  return sortHackathons(filteredRows, now, filter);
}

export async function getContests(filter?: HackathonStatus) {
  const supabase = await createClient();
  const now = new Date();

  let query = supabase
    .from("hackathons")
    .select(FIELDS)
    .eq("category", "contest")
    .limit(200);

  if (!filter || filter !== "ended") {
    query = query.gte("ends_at", now.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch contests:", error.message);
    return [];
  }

  const rows = (data ?? []) as HackathonRow[];
  const filteredRows = filter
    ? rows.filter((row) => getHackathonStatus(row, now) === filter)
    : rows;

  return sortHackathons(filteredRows, now, filter);
}

export async function getDeadlineSoon(days = 7): Promise<HackathonRow[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() + days * 86400000).toISOString();

  const { data } = await supabase
    .from("hackathons")
    .select(FIELDS)
    .gte("ends_at", now)
    .lte("ends_at", cutoff)
    .order("ends_at", { ascending: true })
    .limit(6);

  return ((data ?? []) as HackathonRow[]).filter(isKoreanHackathon);
}

export async function getHomeData() {
  const [hackathons, contests, deadlineSoon, stats] = await Promise.all([
    getHackathons(),
    getContests(),
    getDeadlineSoon(7),
    getStats(),
  ]);

  const allItems = [...hackathons, ...contests];
  const tagCounts = new Map<string, number>();
  for (const item of allItems) {
    for (const tag of item.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  const popularTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return {
    hackathons: hackathons.slice(0, 4),
    contests,
    deadlineSoon,
    stats,
    popularTags,
    lastUpdated: allItems[0]?.collected_at ?? null,
  };
}

export async function getStats() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ count: hackathonCount }, { count: contestCount }] = await Promise.all([
    supabase
      .from("hackathons")
      .select("*", { count: "exact", head: true })
      .neq("category", "contest")
      .gte("ends_at", now),
    supabase
      .from("hackathons")
      .select("*", { count: "exact", head: true })
      .eq("category", "contest")
      .gte("ends_at", now),
  ]);

  return {
    hackathons: hackathonCount ?? 0,
    contests: contestCount ?? 0,
  };
}
