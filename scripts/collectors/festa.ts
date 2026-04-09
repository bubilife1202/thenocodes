import type { Hackathon } from "./types.js";

const FESTA_EVENTS_URL = "https://festa.io/events";
const FESTA_HOST = "https://festa.io";
const FESTA_SITEMAP_CANDIDATES = [
  "https://festa.io/sitemap.xml",
  "https://festa.io/sitemap-index.xml",
  "https://festa.io/server-sitemap.xml",
  "https://festa.io/events-sitemap.xml",
];
const FESTA_QUERY_URLS = [
  `${FESTA_EVENTS_URL}?page=1&query=AI&state=active`,
  `${FESTA_EVENTS_URL}?page=1&query=인공지능&state=active`,
  `${FESTA_EVENTS_URL}?page=1&query=LLM&state=active`,
];
const MAX_FESTA_EVENT_PAGES = 40;

const AI_KEYWORDS = [
  "ai",
  "llm",
  "agent",
  "gpt",
  "openai",
  "claude",
  "rag",
  "machine learning",
  "deep learning",
  "인공지능",
  "생성형",
  "ai agent",
];

const LOCATION_KEYWORDS = [
  "seoul",
  "korea",
  "south korea",
  "서울",
  "대한민국",
  "한국",
  "gangnam",
  "강남",
  "판교",
  "성수",
];

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMetaContent(html: string, key: string): string | null {
  const escaped = escapeRegExp(key);
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]).trim();
  }

  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim() : null;
}

function hasKeyword(haystack: string, keywords: string[]): boolean {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function normalizeFestaEventUrl(url: string): string | null {
  try {
    const parsed = url.startsWith("http") ? new URL(url) : new URL(url, FESTA_HOST);
    if (parsed.hostname !== "festa.io") return null;

    const match = parsed.pathname.match(/^\/events\/(\d+)(?:\/)?$/);
    if (!match) return null;

    return `${FESTA_HOST}/events/${match[1]}`;
  } catch {
    return null;
  }
}

function extractEventUrlsFromHtml(html: string): string[] {
  const urls = new Set<string>();

  for (const match of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const normalized = normalizeFestaEventUrl(match[1]);
    if (normalized) urls.add(normalized);
  }

  for (const match of html.matchAll(/https:\/\/festa\.io\/events\/\d+/gi)) {
    const normalized = normalizeFestaEventUrl(match[0]);
    if (normalized) urls.add(normalized);
  }

  return [...urls];
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)]
    .map((match) => decodeHtmlEntities(match[1]).trim())
    .filter(Boolean);
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml,text/xml",
      },
    });

    if (!res.ok) {
      console.error(`[Festa] Fetch failed: ${url} (${res.status})`);
      return null;
    }

    return res.text();
  } catch (err) {
    console.error(`[Festa] Fetch error: ${url}`, err);
    return null;
  }
}

function readEmbeddedJsonCandidates(html: string): string[] {
  const candidates: string[] = [];
  const scriptPatterns = [
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/gi,
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    /window\.__APOLLO_STATE__\s*=\s*({[\s\S]*?});/gi,
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/gi,
    /window\.__NUXT__\s*=\s*({[\s\S]*?});/gi,
  ];

  for (const pattern of scriptPatterns) {
    for (const match of html.matchAll(pattern)) {
      if (match[1]) candidates.push(match[1].trim());
    }
  }

  return candidates;
}

function collectUrlsFromEmbeddedJson(html: string): string[] {
  const urls = new Set<string>();

  for (const candidate of readEmbeddedJsonCandidates(html)) {
    try {
      const parsed = JSON.parse(candidate);
      const serialized = JSON.stringify(parsed);
      for (const match of serialized.matchAll(/https:\/\/festa\.io\/events\/\d+/gi)) {
        const normalized = normalizeFestaEventUrl(match[0]);
        if (normalized) urls.add(normalized);
      }
    } catch {
      // 일부 스크립트는 JSON이 아닐 수 있으므로 무시한다.
    }
  }

  return [...urls];
}

async function discoverFromSitemaps(): Promise<string[]> {
  const eventUrls = new Set<string>();
  const visited = new Set<string>();
  const queue = [...FESTA_SITEMAP_CANDIDATES];

  while (queue.length > 0 && visited.size < 12) {
    const sitemapUrl = queue.shift();
    if (!sitemapUrl || visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    const xml = await fetchText(sitemapUrl);
    if (!xml || !/<(?:urlset|sitemapindex)\b/i.test(xml)) continue;

    for (const loc of extractLocs(xml)) {
      const normalizedEventUrl = normalizeFestaEventUrl(loc);
      if (normalizedEventUrl) {
        eventUrls.add(normalizedEventUrl);
        continue;
      }

      if (loc.startsWith(FESTA_HOST) && loc.endsWith(".xml") && !visited.has(loc)) {
        queue.push(loc);
      }
    }
  }

  return [...eventUrls];
}

async function discoverFestaEventUrls(): Promise<string[]> {
  const urls = new Set<string>();

  for (const url of [FESTA_EVENTS_URL, ...FESTA_QUERY_URLS]) {
    const html = await fetchText(url);
    if (!html) continue;

    for (const eventUrl of extractEventUrlsFromHtml(html)) urls.add(eventUrl);
    for (const eventUrl of collectUrlsFromEmbeddedJson(html)) urls.add(eventUrl);
  }

  if (urls.size === 0) {
    for (const eventUrl of await discoverFromSitemaps()) urls.add(eventUrl);
  }

  return [...urls]
    .sort((a, b) => {
      const aId = Number(a.match(/\/events\/(\d+)/)?.[1] ?? 0);
      const bId = Number(b.match(/\/events\/(\d+)/)?.[1] ?? 0);
      return bId - aId;
    })
    .slice(0, MAX_FESTA_EVENT_PAGES);
}

function extractJsonLdEvent(html: string): Record<string, unknown> | null {
  for (const raw of readEmbeddedJsonCandidates(html)) {
    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const candidate of candidates) {
        if (candidate && typeof candidate === "object") {
          const type = String((candidate as Record<string, unknown>)["@type"] ?? "").toLowerCase();
          if (type === "event") return candidate as Record<string, unknown>;
        }
      }
    } catch {
      // JSON-LD가 아닌 값은 건너뛴다.
    }
  }

  return null;
}

function parseIsoLikeDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function extractLocationFromSchema(schema: Record<string, unknown> | null): string | null {
  if (!schema) return null;

  const location = schema.location;
  if (!location || typeof location !== "object") return null;

  const loc = location as Record<string, unknown>;
  const name = typeof loc.name === "string" ? loc.name.trim() : "";

  if (loc.address && typeof loc.address === "object") {
    const address = Object.values(loc.address as Record<string, unknown>)
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ");
    return [name, address].filter(Boolean).join(", ") || null;
  }

  return name || null;
}

function extractOrganizerFromSchema(schema: Record<string, unknown> | null): string | null {
  if (!schema) return null;

  const organizer = schema.organizer;
  if (!organizer) return null;

  if (typeof organizer === "string") return organizer.trim();
  if (typeof organizer === "object" && typeof (organizer as Record<string, unknown>).name === "string") {
    return String((organizer as Record<string, unknown>).name).trim();
  }

  return null;
}

function extractTextLocation(text: string): string | null {
  const patterns = [
    /장소\s*[:|-]?\s*(.+?)(?:참가비|신청|주최|문의|$)/i,
    /Location\s*[:|-]?\s*(.+?)(?:Organizer|Host|Fee|Register|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

function isRelevantMeetup(title: string, description: string, location: string | null, text: string): boolean {
  const haystack = [title, description, location ?? "", text].join(" ").toLowerCase();
  return hasKeyword(haystack, AI_KEYWORDS) && hasKeyword(haystack, LOCATION_KEYWORDS);
}

async function parseFestaEvent(url: string): Promise<Hackathon | null> {
  const html = await fetchText(url);
  if (!html) return null;

  const schema = extractJsonLdEvent(html);
  const text = stripHtml(html);
  const title = (
    typeof schema?.name === "string"
      ? schema.name
      : extractMetaContent(html, "og:title")
        ?? extractTitleTag(html)?.replace(/\s*[|·-]\s*Festa!?[\s\S]*$/i, "")
        ?? ""
  ).trim();
  const description = (
    typeof schema?.description === "string"
      ? schema.description
      : extractMetaContent(html, "og:description")
        ?? extractMetaContent(html, "description")
        ?? ""
  ).trim().slice(0, 300);
  const location = extractLocationFromSchema(schema) ?? extractTextLocation(text);
  const organizer = extractOrganizerFromSchema(schema);
  const startsAt = parseIsoLikeDate(schema?.startDate);
  const endsAt = parseIsoLikeDate(schema?.endDate);
  const thumbnailUrl = Array.isArray(schema?.image)
    ? String(schema?.image[0] ?? "")
    : typeof schema?.image === "string"
      ? schema.image
      : extractMetaContent(html, "og:image");
  const externalId = url.match(/\/events\/(\d+)/)?.[1];

  if (!externalId || !title) return null;
  if (html.includes("You need to enable JavaScript to run this app.") && !schema && !extractMetaContent(html, "og:title")) {
    return null;
  }
  if (endsAt && new Date(endsAt) < new Date()) return null;
  if (!isRelevantMeetup(title, description, location, text)) return null;

  return {
    source: "festa",
    external_id: externalId,
    title,
    description,
    organizer,
    url,
    thumbnail_url: thumbnailUrl || null,
    prize: null,
    tags: ["AI", "밋업", "서울", "Festa"],
    starts_at: startsAt,
    ends_at: endsAt,
    location,
    category: "meetup",
  };
}

export async function collectFesta(): Promise<Hackathon[]> {
  const candidateUrls = await discoverFestaEventUrls();
  const results = await Promise.all(candidateUrls.map((url) => parseFestaEvent(url)));
  const seen = new Set<string>();
  const meetups = results.filter((item): item is Hackathon => {
    if (!item || seen.has(item.external_id)) return false;
    seen.add(item.external_id);
    return true;
  });

  console.log(`[Festa] Collected ${meetups.length} meetups`);
  return meetups;
}
