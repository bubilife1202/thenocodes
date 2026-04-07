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
  const now = new Date().toISOString();

  let query = supabase
    .from("hackathons")
    .select("*")
    .order("ends_at", { ascending: true, nullsFirst: false });

  if (filter === "upcoming") {
    query = query.gt("starts_at", now);
  } else if (filter === "active") {
    // Active: started (or no start date) AND not ended yet
    query = query.or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gte.${now}`);
  } else if (filter === "ended") {
    query = query.not("ends_at", "is", null).lt("ends_at", now);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error("Failed to fetch hackathons:", error.message);
    return [];
  }

  const rows = (data ?? []) as HackathonRow[];

  // For "all" view: sort by status priority (active first, then upcoming, then ended)
  // Within each group, sort by ends_at ascending (deadline soonest first)
  if (!filter) {
    const priority: Record<HackathonStatus, number> = { active: 0, upcoming: 1, ended: 2 };
    rows.sort((a, b) => {
      const pa = priority[getHackathonStatus(a)];
      const pb = priority[getHackathonStatus(b)];
      if (pa !== pb) return pa - pb;
      const ea = a.ends_at ? new Date(a.ends_at).getTime() : Infinity;
      const eb = b.ends_at ? new Date(b.ends_at).getTime() : Infinity;
      return ea - eb;
    });
  }

  return rows;
}
