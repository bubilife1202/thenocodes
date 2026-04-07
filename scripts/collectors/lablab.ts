import type { Hackathon } from "./types.js";

const LABLAB_URL = "https://lablab.ai/event";

export async function collectLablab(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await fetch(LABLAB_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      console.error(`[Lablab] Failed: ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Extract event links and titles from listing page
    const eventRegex = /<a[^>]*href="\/event\/([^"]+)"[^>]*>/gi;
    const matches = [...html.matchAll(eventRegex)];

    const seen = new Set<string>();

    for (const match of matches) {
      const slug = match[1];
      if (seen.has(slug) || slug.includes("/")) continue;
      seen.add(slug);

      const title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      hackathons.push({
        source: "lablab",
        external_id: slug,
        title,
        description: "",
        organizer: "Lablab.ai",
        url: `https://lablab.ai/event/${slug}`,
        thumbnail_url: null,
        prize: null,
        tags: ["AI", "GenAI", "LLM"],
        starts_at: null,
        ends_at: null,
        location: "Online",
      });
    }
  } catch (err) {
    console.error("[Lablab] Error:", err);
  }

  console.log(`[Lablab] Collected ${hackathons.length} hackathons`);
  return hackathons;
}
