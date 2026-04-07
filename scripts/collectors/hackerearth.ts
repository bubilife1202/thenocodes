import type { Hackathon } from "./types.js";

const HACKEREARTH_API =
  "https://www.hackerearth.com/chrome-extension/events/";

export async function collectHackerEarth(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await fetch(HACKEREARTH_API, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`[HackerEarth] Failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const events = data.response ?? [];

    for (const e of events) {
      if (e.event_type !== "hackathon") continue;

      hackathons.push({
        source: "hackerearth",
        external_id: e.id?.toString() ?? e.url,
        title: e.title,
        description: e.description ?? "",
        organizer: e.organization ?? null,
        url: e.url,
        thumbnail_url: e.cover_image ?? null,
        prize: null,
        tags: ["Coding", "Tech"],
        starts_at: e.start_utc_tz ?? null,
        ends_at: e.end_utc_tz ?? null,
        location: e.location ?? "Online",
      });
    }
  } catch (err) {
    console.error("[HackerEarth] Error:", err);
  }

  console.log(`[HackerEarth] Collected ${hackathons.length} hackathons`);
  return hackathons;
}
