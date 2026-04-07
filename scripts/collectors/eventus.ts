import type { Hackathon } from "./types.js";

const EVENTUS_API = "https://api.event-us.kr/api/v1/engine/search";

export async function collectEventUs(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  const seen = new Set<string>();

  try {
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(EVENTUS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "해커톤",
          page: { current: page, size: 20 },
        }),
      });

      if (!res.ok) {
        console.error(`[EventUs] page ${page} failed: ${res.status}`);
        break;
      }

      const data = await res.json();
      const items = data.results ?? [];

      if (items.length === 0) break;

      for (const e of items) {
        const id = e.id?.raw?.toString();
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const title = e.title?.raw ?? "";
        const state = e.state?.raw;
        const subdomain = e.subdomain?.raw ?? "";

        // Skip temp/unpublished
        if (state === "Temp" || state === "unpublished") continue;

        const startsAt = e.start_date?.raw ?? null;
        const endsAt = e.close_date?.raw ?? null;

        // Skip events that ended before 2026
        if (endsAt && new Date(endsAt) < new Date("2025-06-01")) continue;

        const coverImage = e.cover_image_url?.raw;
        const thumbnail = coverImage
          ? coverImage.startsWith("http")
            ? coverImage
            : `https://eventusstorage.blob.core.windows.net/evs${coverImage}`
          : null;

        const location = e.area?.raw ?? e.area_detail?.raw ?? null;
        const description = e.description?.raw ?? "";
        const organizer = e.app_title?.raw ?? e.fullname?.raw ?? null;

        hackathons.push({
          source: "eventus",
          external_id: id,
          title,
          description: description.slice(0, 300),
          organizer,
          url: `https://event-us.kr/${subdomain}/${id}`,
          thumbnail_url: thumbnail,
          prize: null,
          tags: e.tags?.raw?.length ? e.tags.raw : ["해커톤"],
          starts_at: startsAt,
          ends_at: endsAt,
          location,
        });
      }
    }
  } catch (err) {
    console.error("[EventUs] Error:", err);
  }

  console.log(`[EventUs] Collected ${hackathons.length} hackathons`);
  return hackathons;
}
