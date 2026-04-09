import type { Hackathon } from "./types.js";

// Festa.io 서울 AI/테크 밋업 수집 — HTML 파싱 방식
const FESTA_SEARCH_URL = "https://festa.io/events";

const SEARCH_QUERIES = ["AI", "인공지능", "LLM", "노코드", "해커톤", "데이터"];

export async function collectFesta(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  const seen = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    try {
      const url = `${FESTA_SEARCH_URL}?page=1&query=${encodeURIComponent(query)}&state=active`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
          Accept: "text/html",
        },
      });

      if (!res.ok) {
        console.error(`[Festa] Query "${query}" failed: ${res.status}`);
        continue;
      }

      const html = await res.text();

      // __NEXT_DATA__에서 이벤트 추출
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!nextDataMatch) continue;

      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const events = nextData?.props?.pageProps?.events
          ?? nextData?.props?.pageProps?.initialData?.events
          ?? [];

        for (const event of events) {
          const id = String(event.eventId ?? event.id ?? "");
          if (!id || seen.has(id)) continue;
          seen.add(id);

          const startsAt = event.startDate ?? null;
          const endsAt = event.endDate ?? null;

          if (endsAt && new Date(endsAt) < new Date()) continue;

          hackathons.push({
            source: "festa",
            external_id: id,
            title: event.name ?? event.title ?? "",
            description: (event.metadata?.description ?? event.description ?? "").slice(0, 300),
            organizer: event.hostName ?? null,
            url: `https://festa.io/events/${id}`,
            thumbnail_url: event.metadata?.coverImage ?? null,
            prize: null,
            tags: ["밋업", "서울", "Festa"],
            starts_at: startsAt,
            ends_at: endsAt,
            location: event.location ?? "서울",
            category: "meetup",
          });
        }
      } catch {
        // JSON 파싱 실패
      }
    } catch (err) {
      console.error(`[Festa] Query "${query}" error:`, err);
    }
  }

  console.log(`[Festa] Collected ${hackathons.length} meetups`);
  return hackathons;
}
