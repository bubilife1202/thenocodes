import type { Hackathon } from "./types.js";

const LUMA_SEOUL_URL = "https://luma.com/seoul?k=p";
const LUMA_HOST = "https://luma.com";
const MAX_LUMA_EVENT_PAGES = 18;

const AI_KEYWORDS = [
  "ai",
  "llm",
  "agent",
  "gpt",
  "openai",
  "claude",
  "rag",
  "ml",
  "machine learning",
  "인공지능",
  "생성형",
  "생성 ai",
  "ai agents",
];

const SEOUL_KEYWORDS = [
  "seoul",
  "korea",
  "south korea",
  "서울",
  "대한민국",
  "한국",
  "gangnam",
  "강남",
];

const EVENT_KEYWORDS = [
  "meetup",
  "network",
  "networking",
  "seminar",
  "workshop",
  "community",
  "밋업",
  "네트워킹",
  "세미나",
  "워크샵",
  "워크숍",
  "커뮤니티",
];

const EXCLUDED_PATHS = new Set([
  "",
  "discover",
  "pricing",
  "help",
  "signin",
  "login",
  "logout",
  "signup",
  "explore",
  "search",
  "seoul",
  "tokyo",
  "community",
]);

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
  if (!match?.[1]) return null;
  return decodeHtmlEntities(match[1]).replace(/\s+/g, " ").trim();
}

function normalizeLumaUrl(href: string): string | null {
  try {
    const url = href.startsWith("http") ? new URL(href) : new URL(href, LUMA_HOST);
    if (url.hostname !== "luma.com" && url.hostname !== "lu.ma") return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) return null;

    const slug = parts[0];
    if (
      EXCLUDED_PATHS.has(slug.toLowerCase()) ||
      slug.startsWith("_") ||
      slug.includes(".") ||
      slug.length < 4
    ) {
      return null;
    }

    return `${LUMA_HOST}/${slug}`;
  } catch {
    return null;
  }
}

function extractEventUrls(html: string): string[] {
  const urls = new Set<string>();
  const matches = html.matchAll(/href=["']([^"'#]+)["']/gi);

  for (const match of matches) {
    const normalized = normalizeLumaUrl(match[1]);
    if (normalized) urls.add(normalized);
  }

  return [...urls].slice(0, MAX_LUMA_EVENT_PAGES);
}

function hasKeyword(haystack: string, keywords: string[]): boolean {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function parseHour(hour: number, meridiem: string | undefined): number {
  if (!meridiem) return hour;

  const normalized = meridiem.toLowerCase();
  if (normalized === "pm" || normalized === "오후") return hour === 12 ? 12 : hour + 12;
  if (normalized === "am" || normalized === "오전") return hour === 12 ? 0 : hour;
  return hour;
}

function toKstIso(year: number, month: number, day: number, hour: number, minute: number): string {
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute)).toISOString();
}

function parseDateRange(text: string): { startsAt: string | null; endsAt: string | null } {
  const english = text.match(
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Z][a-z]+)\s+(\d{1,2}),\s+(\d{4})\s*[·|]\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );
  if (english) {
    const months: Record<string, number> = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    const month = months[english[1].toLowerCase()];
    const day = Number(english[2]);
    const year = Number(english[3]);
    const startHour = parseHour(Number(english[4]), english[6]);
    const endHour = parseHour(Number(english[7]), english[9]);
    const startMinute = Number(english[5]);
    const endMinute = Number(english[8]);

    const startsAt = toKstIso(year, month, day, startHour, startMinute);
    let endsAt = toKstIso(year, month, day, endHour, endMinute);

    if (new Date(endsAt) < new Date(startsAt)) {
      endsAt = new Date(new Date(endsAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return { startsAt, endsAt };
  }

  const korean = text.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일[^\d]*(오전|오후)\s*(\d{1,2}):(\d{2})\s*[–-]\s*(오전|오후)\s*(\d{1,2}):(\d{2})/
  );
  if (korean) {
    const year = Number(korean[1]);
    const month = Number(korean[2]);
    const day = Number(korean[3]);
    const startsAt = toKstIso(year, month, day, parseHour(Number(korean[5]), korean[4]), Number(korean[6]));
    let endsAt = toKstIso(year, month, day, parseHour(Number(korean[8]), korean[7]), Number(korean[9]));

    if (new Date(endsAt) < new Date(startsAt)) {
      endsAt = new Date(new Date(endsAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return { startsAt, endsAt };
  }

  return { startsAt: null, endsAt: null };
}

function extractOrganizer(text: string): string | null {
  const patterns = [
    /Hosted by\s+(.+?)(?:Registration|About Event|Location|Hosted By|Contact the Host|Report Event|Featured in)/i,
    /Hosted By\s+(.+?)(?:Going|Contact the Host|Report Event|Discover)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return null;
}

function extractLocation(text: string): string | null {
  const patterns = [
    /Location\s+(.+?)(?:Hosted By|Contact the Host|Report Event|Discover|$)/i,
    /Venue\s+(.+?)(?:Partners|Parking|Location|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const fallback = text.match(/\b(?:Dreamplus|DreamPlus|Seoul|Gangnam)[^.!?]{0,80}/i);
  return fallback?.[0]?.trim() ?? null;
}

function buildDescription(html: string, text: string): string {
  const metaDescription =
    extractMetaContent(html, "og:description") ??
    extractMetaContent(html, "description");
  if (metaDescription) return metaDescription.slice(0, 300);

  const aboutMatch = text.match(/About(?: Event)?\s+(.+?)(?:Co-hosts|What to Expect|Venue|Location|Hosted By|$)/i);
  return (aboutMatch?.[1] ?? "").trim().slice(0, 300);
}

function isRelevantMeetup(title: string, description: string, location: string | null, text: string): boolean {
  const haystack = [title, description, location ?? "", text].join(" ").toLowerCase();
  return hasKeyword(haystack, AI_KEYWORDS)
    && (hasKeyword(haystack, SEOUL_KEYWORDS) || hasKeyword(haystack, EVENT_KEYWORDS));
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    console.error(`[Luma] Fetch failed: ${url} (${res.status})`);
    return null;
  }

  return res.text();
}

async function parseLumaEvent(url: string): Promise<Hackathon | null> {
  const html = await fetchText(url);
  if (!html) return null;

  const text = stripHtml(html);
  const slug = new URL(url).pathname.split("/").filter(Boolean)[0] ?? url;
  const title = (
    extractMetaContent(html, "og:title")
      ?? extractTitleTag(html)?.replace(/\s*[·|-]\s*Luma\s*$/i, "")
      ?? ""
  ).trim();
  const description = buildDescription(html, text);
  const organizer = extractOrganizer(text);
  const location = extractLocation(text) ?? "서울";
  const thumbnailUrl = extractMetaContent(html, "og:image");
  const { startsAt, endsAt } = parseDateRange(text);

  if (!title) return null;
  if (endsAt && new Date(endsAt) < new Date()) return null;
  if (!isRelevantMeetup(title, description, location, text)) return null;

  return {
    source: "luma",
    external_id: slug,
    title,
    description,
    organizer,
    url,
    thumbnail_url: thumbnailUrl,
    prize: null,
    tags: ["AI", "밋업", "서울", "Luma"],
    starts_at: startsAt,
    ends_at: endsAt,
    location,
    category: "meetup",
  };
}

export async function collectLuma(): Promise<Hackathon[]> {
  try {
    const cityHtml = await fetchText(LUMA_SEOUL_URL);
    if (!cityHtml) return [];

    const candidateUrls = extractEventUrls(cityHtml);
    const results = await Promise.all(candidateUrls.map((url) => parseLumaEvent(url)));
    const seen = new Set<string>();
    const meetups = results.filter((item): item is Hackathon => {
      if (!item || seen.has(item.external_id)) return false;
      seen.add(item.external_id);
      return true;
    });

    console.log(`[Luma] Collected ${meetups.length} meetups`);
    return meetups;
  } catch (err) {
    console.error("[Luma] Error:", err);
    return [];
  }
}
