import type { Hackathon } from "./types.js";

const DACON_URL = "https://dacon.io/competitions";

export async function collectDacon(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await fetch(DACON_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      console.error(`[Dacon] Failed: ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Extract competition cards from HTML
    const cardRegex = /<a[^>]*href="\/competitions\/(\d+)"[^>]*>[\s\S]*?<\/a>/gi;
    const titleRegex = /class="[^"]*title[^"]*"[^>]*>([^<]+)</gi;
    const matches = html.matchAll(cardRegex);

    for (const match of matches) {
      const id = match[1];
      const cardHtml = match[0];

      const titleMatch = titleRegex.exec(cardHtml);
      titleRegex.lastIndex = 0;
      const title = titleMatch?.[1]?.trim();

      if (!title || !id) continue;

      hackathons.push({
        source: "dacon",
        external_id: id,
        title,
        description: "",
        organizer: "Dacon",
        url: `https://dacon.io/competitions/${id}`,
        thumbnail_url: null,
        prize: null,
        tags: ["AI", "Data Science"],
        starts_at: null,
        ends_at: null,
        location: "Online",
      });
    }
  } catch (err) {
    console.error("[Dacon] Error:", err);
  }

  console.log(`[Dacon] Collected ${hackathons.length} competitions`);
  return hackathons;
}
