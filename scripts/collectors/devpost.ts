import type { Hackathon } from "./types.js";

const DEVPOST_API = "https://devpost.com/api/hackathons";

export async function collectDevpost(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  for (let page = 1; page <= 3; page++) {
    const url = `${DEVPOST_API}?page=${page}&status[]=upcoming&status[]=open`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`Devpost page ${page} failed: ${res.status}`);
      break;
    }

    const data = await res.json();
    const items = data.hackathons ?? [];

    if (items.length === 0) break;

    for (const h of items) {
      hackathons.push({
        source: "devpost",
        external_id: h.id?.toString() ?? h.url,
        title: h.title,
        description: h.tagline ?? h.description ?? "",
        organizer: h.organization_name ?? null,
        url: h.url,
        thumbnail_url: h.thumbnail_url ?? null,
        prize: h.prize_amount ? `$${h.prize_amount.toLocaleString()}` : null,
        tags: h.themes?.map((t: { name: string }) => t.name) ?? [],
        starts_at: h.submission_period_dates?.start ?? null,
        ends_at: h.submission_period_dates?.end ?? null,
        location: h.displayed_location?.location ?? "Online",
      });
    }
  }

  console.log(`[Devpost] Collected ${hackathons.length} hackathons`);
  return hackathons;
}
