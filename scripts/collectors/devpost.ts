import type { Hackathon } from "./types.js";

const DEVPOST_API = "https://devpost.com/api/hackathons";

function cleanPrize(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip HTML: "$<span data-currency-value>10,000</span>" → "$10,000"
  const cleaned = raw.replace(/<[^>]+>/g, "").trim();
  if (cleaned === "$0" || cleaned === "") return null;
  return cleaned;
}

function parseDateRange(dateStr: string | null | undefined): { start: string | null; end: string | null } {
  if (!dateStr) return { start: null, end: null };

  // "Feb 26 - Apr 29, 2026" or "Mar 15, 2026 - Apr 29, 2026"
  const parts = dateStr.split(" - ");
  if (parts.length !== 2) return { start: null, end: null };

  const endPart = parts[1].trim(); // "Apr 29, 2026"
  let startPart = parts[0].trim(); // "Feb 26" or "Mar 15, 2026"

  // If start doesn't have year, borrow from end
  if (!startPart.match(/\d{4}/)) {
    const yearMatch = endPart.match(/\d{4}/);
    if (yearMatch) {
      startPart = `${startPart}, ${yearMatch[0]}`;
    }
  }

  const startDate = new Date(startPart);
  const endDate = new Date(endPart);

  return {
    start: isNaN(startDate.getTime()) ? null : startDate.toISOString(),
    end: isNaN(endDate.getTime()) ? null : endDate.toISOString(),
  };
}

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
      const dates = parseDateRange(h.submission_period_dates);

      hackathons.push({
        source: "devpost",
        external_id: h.id?.toString() ?? h.url,
        title: h.title,
        description: h.time_left_to_submission ?? "",
        organizer: h.organization_name ?? null,
        url: h.url,
        thumbnail_url: h.thumbnail_url ? `https:${h.thumbnail_url}` : null,
        prize: cleanPrize(h.prize_amount),
        tags: h.themes?.map((t: { name: string }) => t.name) ?? [],
        starts_at: dates.start,
        ends_at: dates.end,
        location: h.displayed_location?.location ?? "Online",
      });
    }
  }

  console.log(`[Devpost] Collected ${hackathons.length} hackathons`);
  return hackathons;
}
