import type { Hackathon } from "./types.js";

// Luma 공개 이벤트 검색 — 서울/한국 AI 관련 밋업 수집
const LUMA_DISCOVER_API = "https://api.lu.ma/public/v2/event/search";
const LUMA_SEARCH_QUERIES = [
  "AI Seoul",
  "AI 서울",
  "AI Korea",
  "AI meetup Seoul",
  "tech meetup 서울",
  "노코드 서울",
  "LLM 서울",
  "builder Seoul",
];

// Luma API가 제한적이므로, discover 페이지 HTML 파싱도 병행
const LUMA_DISCOVER_URL = "https://lu.ma/discover?where=Seoul";

async function searchLumaApi(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];
  const seen = new Set<string>();

  for (const query of LUMA_SEARCH_QUERIES) {
    try {
      const res = await fetch(`${LUMA_DISCOVER_API}?query=${encodeURIComponent(query)}&geo_latitude=37.5665&geo_longitude=126.9780&geo_radius=50km`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        // Luma API가 공개되지 않은 경우 HTML 파싱으로 폴백
        continue;
      }

      const data = await res.json();
      const entries = data.entries ?? data.events ?? data.data ?? [];

      for (const event of entries) {
        const id = event.api_id ?? event.id ?? event.url;
        if (!id || seen.has(id)) continue;
        seen.add(id);

        const startsAt = event.start_at ?? event.starts_at ?? null;
        const endsAt = event.end_at ?? event.ends_at ?? null;

        // 이미 끝난 이벤트 스킵
        if (endsAt && new Date(endsAt) < new Date()) continue;

        hackathons.push({
          source: "luma",
          external_id: String(id),
          title: event.name ?? event.title ?? "",
          description: (event.description_short ?? event.description ?? "").slice(0, 300),
          organizer: event.hosts?.[0]?.name ?? event.organizer ?? null,
          url: event.url?.startsWith("http") ? event.url : `https://lu.ma/${event.url ?? id}`,
          thumbnail_url: event.cover_url ?? null,
          prize: null,
          tags: ["AI", "밋업", "서울", "Luma"],
          starts_at: startsAt,
          ends_at: endsAt,
          location: event.geo_address_info?.full_address ?? event.location ?? "서울",
          category: "meetup",
        });
      }
    } catch (err) {
      console.error(`[Luma] Query "${query}" failed:`, err);
    }
  }

  return hackathons;
}

async function scrapeLumaDiscover(): Promise<Hackathon[]> {
  const hackathons: Hackathon[] = [];

  try {
    const res = await fetch(LUMA_DISCOVER_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      console.error(`[Luma Discover] Failed: ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Luma 페이지의 __NEXT_DATA__ 또는 JSON-LD에서 이벤트 추출
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const events = nextData?.props?.pageProps?.initialData?.events
          ?? nextData?.props?.pageProps?.events
          ?? [];

        for (const event of events) {
          const id = event.api_id ?? event.url ?? event.id;
          if (!id) continue;

          const endsAt = event.end_at ?? null;
          if (endsAt && new Date(endsAt) < new Date()) continue;

          hackathons.push({
            source: "luma",
            external_id: String(id),
            title: event.name ?? "",
            description: (event.description_short ?? "").slice(0, 300),
            organizer: event.hosts?.[0]?.name ?? null,
            url: `https://lu.ma/${event.url ?? id}`,
            thumbnail_url: event.cover_url ?? null,
            prize: null,
            tags: ["AI", "밋업", "서울", "Luma"],
            starts_at: event.start_at ?? null,
            ends_at: endsAt,
            location: event.geo_address_info?.full_address ?? "서울",
            category: "meetup",
          });
        }
      } catch {
        // JSON 파싱 실패 — 무시
      }
    }

    // 링크 기반 폴백: /e/ 또는 이벤트 슬러그 추출
    const linkRegex = /href="\/([a-z0-9-]+)"[^>]*>/gi;
    const matches = [...html.matchAll(linkRegex)];
    for (const match of matches) {
      const slug = match[1];
      if (!slug || slug.includes("/") || slug.length < 4 || slug.startsWith("_")) continue;
      // 이미 수집한 것이면 스킵
      if (hackathons.some((h) => h.external_id === slug)) continue;

      // 개별 이벤트 페이지에서 상세 정보를 가져오지는 않음 (rate limit 방지)
      // 대신 슬러그만 기록하고 다음 수집 시 API로 상세 정보 가져옴
    }
  } catch (err) {
    console.error("[Luma Discover] Error:", err);
  }

  return hackathons;
}

export async function collectLuma(): Promise<Hackathon[]> {
  const [apiResults, discoverResults] = await Promise.allSettled([
    searchLumaApi(),
    scrapeLumaDiscover(),
  ]);

  const all: Hackathon[] = [];
  const seen = new Set<string>();

  for (const result of [apiResults, discoverResults]) {
    if (result.status === "fulfilled") {
      for (const h of result.value) {
        if (!seen.has(h.external_id)) {
          seen.add(h.external_id);
          all.push(h);
        }
      }
    }
  }

  console.log(`[Luma] Collected ${all.length} meetups`);
  return all;
}
