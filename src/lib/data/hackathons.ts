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

async function getEvents(
  category: string,
  filter?: HackathonStatus,
): Promise<HackathonRow[]> {
  const supabase = await createClient();
  const now = new Date();

  let query = supabase
    .from("hackathons")
    .select(FIELDS)
    .eq("category", category)
    .limit(200);

  if (!filter || filter !== "ended") {
    query = query.or(`ends_at.gte.${now.toISOString()},ends_at.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`Failed to fetch ${category}:`, error.message);
    return [];
  }

  const rows = ((data ?? []) as HackathonRow[]).filter(isKoreanHackathon);
  const filteredRows = filter
    ? rows.filter((row) => getHackathonStatus(row, now) === filter)
    : rows;

  return sortHackathons(filteredRows, now, filter);
}

export async function getHackathons(filter?: HackathonStatus) {
  return getEvents("hackathon", filter);
}

export async function getContests(filter?: HackathonStatus) {
  return getEvents("contest", filter);
}

export async function getMeetups(filter?: HackathonStatus) {
  return getEvents("meetup", filter);
}

export async function getHomeData() {
  const [hackathons, contests] = await Promise.all([
    getHackathons(),
    getContests(),
  ]);

  return { hackathons, contests };
}

export async function getStats() {
  // Use the same filtered data as the actual pages to ensure consistent counts
  const [hackathons, contests, meetups] = await Promise.all([
    getHackathons(),
    getContests(),
    getMeetups(),
  ]);

  return {
    hackathons: hackathons.length,
    contests: contests.length,
    meetups: meetups.length,
  };
}
