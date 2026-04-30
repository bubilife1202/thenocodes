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
  "노코드",
  "nocode",
  "no-code",
  "프롬프트",
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
  "판교",
  "pangyo",
];

const EVENT_KEYWORDS = [
  "meetup",
  "network",
  "networking",
  "seminar",
  "workshop",
  "community",
  "conference",
  "밋업",
  "네트워킹",
  "세미나",
  "워크샵",
  "워크숍",
  "커뮤니티",
  "컨퍼런스",
  "해커톤",
];

const EXCLUDED_PATHS = new Set([
  "",
  "android",
  "app",
  "apps",
  "community",
  "discover",
  "download",
  "explore",
  "get",
  "help",
  "ios",
  "login",
  "logout",
  "mobile",
  "pricing",
  "search",
  "seoul",
  "signin",
  "signup",
  "tokyo",
]);

interface StructuredEvent {
  title: string | null;
  description: string | null;
  organizer: string | null;
  location: string | null;
  startsAt: string | null;
  endsAt: string | null;
  thumbnailUrl: string | null;
}

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

function normalizeWhitespace(input: string): string {
  return decodeHtmlEntities(input).replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}

function stripHtml(html: string): string {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
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
    if (match?.[1]) return normalizeWhitespace(match[1]);
  }

  return null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return null;
  return normalizeWhitespace(match[1]);
}

function cleanLumaTitle(value: string | null | undefined): string {
  return normalizeWhitespace(value ?? "")
    .replace(/\s*[·|-]\s*Luma\s*$/i, "")
    .trim();
}

function cleanDescription(value: string | null | undefined): string {
  return normalizeWhitespace(value ?? "")
    .replace(/Please register to see the exact location of this event\.?/gi, "")
    .replace(/Presented by\s+.+?\s+Subscribe\b.*$/i, "")
    .replace(/\bHosted by\b.*$/i, "")
    .replace(/\b\d+\s+Going\b.*$/i, "")
    .replace(/\bGoing\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

function cleanPersonOrOrg(value: string | null | undefined): string | null {
  const cleaned = normalizeWhitespace(value ?? "")
    .replace(/\b\d+\s+Going\b.*$/i, "")
    .replace(/\bGoing\b.*$/i, "")
    .replace(/\bHosted By\b/gi, "")
    .replace(/\bHosted by\b/gi, "")
    .replace(/\bPresented by\b.*$/i, "")
    .replace(/\bSubscribe\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function cleanLocation(value: string | null | undefined): string | null {
  const cleaned = normalizeWhitespace(value ?? "")
    .replace(/Location\s+/i, "")
    .replace(/Please register[^.!?]*(?:exact|location)[^.!?]*(?:event)?\.?/gi, "")
    .replace(/Register to See Address/gi, "")
    .replace(/·\s*Luma\b.*$/i, "")
    .replace(/\bLuma Explore Events\b.*$/i, "")
    .replace(/\bSign In\b.*$/i, "")
    .replace(/Presented by\s+.+?\s+Subscribe\b.*$/i, "")
    .replace(/\bHosted By\b.*$/i, "")
    .replace(/\b\d+\s+Going\b.*$/i, "")
    .replace(/\bGoing\b.*$/i, "")
    .replace(/\bSubscribe\b.*$/i, "")
    .replace(/\s+/g, " ")
    .replace(/^[-,·\s]+|[-,·\s]+$/g, "")
    .trim();

  return cleaned || null;
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

export function extractEventUrls(html: string): string[] {
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

function normalizeIso(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
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

  const koreanWithMeridiem = text.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일[^\d]*(오전|오후)\s*(\d{1,2}):(\d{2})\s*[–-]\s*(오전|오후)\s*(\d{1,2}):(\d{2})/
  );
  if (koreanWithMeridiem) {
    const year = Number(koreanWithMeridiem[1]);
    const month = Number(koreanWithMeridiem[2]);
    const day = Number(koreanWithMeridiem[3]);
    const startsAt = toKstIso(year, month, day, parseHour(Number(koreanWithMeridiem[5]), koreanWithMeridiem[4]), Number(koreanWithMeridiem[6]));
    let endsAt = toKstIso(year, month, day, parseHour(Number(koreanWithMeridiem[8]), koreanWithMeridiem[7]), Number(koreanWithMeridiem[9]));

    if (new Date(endsAt) < new Date(startsAt)) {
      endsAt = new Date(new Date(endsAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return { startsAt, endsAt };
  }

  const korean24h = text.match(
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일[^\d]*(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/
  );
  if (korean24h) {
    const year = Number(korean24h[1]);
    const month = Number(korean24h[2]);
    const day = Number(korean24h[3]);
    const startsAt = toKstIso(year, month, day, Number(korean24h[4]), Number(korean24h[5]));
    let endsAt = toKstIso(year, month, day, Number(korean24h[6]), Number(korean24h[7]));

    if (new Date(endsAt) < new Date(startsAt)) {
      endsAt = new Date(new Date(endsAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return { startsAt, endsAt };
  }

  return { startsAt: null, endsAt: null };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? normalizeWhitespace(value) : null;
}

function typeContains(value: unknown, target: string): boolean {
  if (Array.isArray(value)) return value.some((item) => typeContains(item, target));
  return typeof value === "string" && value.toLowerCase() === target.toLowerCase();
}

function flattenJsonLd(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  const record = asRecord(value);
  if (!record) return [];

  const nested = [record["@graph"], record.itemListElement, record.event, record.events]
    .flatMap((item) => flattenJsonLd(item));

  return [record, ...nested];
}

function extractJsonLdEvents(html: string): Record<string, unknown>[] {
  const scripts = html.matchAll(/<script[^>]+type=["'][^"']*application\/ld\+json[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi);
  const events: Record<string, unknown>[] = [];

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(decodeHtmlEntities(script[1]).trim());
      events.push(...flattenJsonLd(parsed).filter((item) => typeContains(item["@type"], "Event")));
    } catch {
      // Ignore malformed third-party structured data and continue with fallbacks.
    }
  }

  return events;
}

function readImage(value: unknown): string | null {
  if (Array.isArray(value)) return value.map(readImage).find(Boolean) ?? null;
  if (typeof value === "string") return normalizeWhitespace(value);
  const record = asRecord(value);
  return asString(record?.url) ?? asString(record?.contentUrl);
}

function readOrganizer(value: unknown): string | null {
  const values = (Array.isArray(value) ? value : [value])
    .map((item) => {
      const record = asRecord(item);
      return cleanPersonOrOrg(asString(record?.name) ?? asString(item));
    })
    .filter((item): item is string => Boolean(item));

  return values.length > 0 ? [...new Set(values)].slice(0, 3).join(" · ") : null;
}

function readAddress(value: unknown): string | null {
  if (typeof value === "string") return cleanLocation(value);

  const record = asRecord(value);
  if (!record) return null;

  return [record.streetAddress, record.addressLocality, record.addressRegion, record.addressCountry]
    .map(asString)
    .filter((item): item is string => Boolean(item && !/Register to See Address/i.test(item)))
    .join(", ") || null;
}

function readLocation(value: unknown): string | null {
  const record = asRecord(Array.isArray(value) ? value[0] : value);
  if (!record) return cleanLocation(asString(value));

  const name = cleanLocation(asString(record.name));
  const address = readAddress(record.address);
  if (name && address && !address.toLowerCase().includes(name.toLowerCase())) return `${name}, ${address}`;
  return name ?? address;
}

function extractStructuredEvent(html: string): StructuredEvent {
  const event = extractJsonLdEvents(html)[0];
  if (!event) {
    return {
      title: null,
      description: null,
      organizer: null,
      location: null,
      startsAt: null,
      endsAt: null,
      thumbnailUrl: null,
    };
  }

  return {
    title: cleanLumaTitle(asString(event.name)),
    description: cleanDescription(asString(event.description)),
    organizer: readOrganizer(event.organizer),
    location: readLocation(event.location),
    startsAt: normalizeIso(event.startDate),
    endsAt: normalizeIso(event.endDate),
    thumbnailUrl: readImage(event.image),
  };
}

function extractOrganizer(text: string): string | null {
  const patterns = [
    /Hosted by\s+(.+?)(?:Registration|About Event|Location|Hosted By|Contact the Host|Report Event|Featured in|$)/i,
    /Hosted By\s+(.+?)(?:Going|Contact the Host|Report Event|Discover|$)/i,
    /Presented by\s+(.+?)(?:Subscribe|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const cleaned = cleanPersonOrOrg(match?.[1]);
    if (cleaned) return cleaned;
  }

  return null;
}

function extractLocation(text: string): string | null {
  const patterns = [
    /Location\s+(.+?)(?:Hosted By|Contact the Host|Report Event|Discover|Presented by|$)/i,
    /Venue\s+(.+?)(?:Partners|Parking|Location|Presented by|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const cleaned = cleanLocation(match?.[1]);
    if (cleaned) return cleaned;
  }

  const fallback = text.match(/\b(?:Dreamplus|DreamPlus|Seoul|Gangnam|Pangyo|판교|서울|강남)[^.!?]{0,80}/i);
  return cleanLocation(fallback?.[0]);
}

function buildDescription(html: string, text: string, structured: StructuredEvent): string {
  const description =
    structured.description
      ?? cleanDescription(extractMetaContent(html, "og:description"))
      ?? cleanDescription(extractMetaContent(html, "description"));
  if (description) return description;

  const aboutMatch = text.match(/About(?: Event)?\s+(.+?)(?:Co-hosts|What to Expect|Venue|Location|Hosted By|$)/i);
  return cleanDescription(aboutMatch?.[1]);
}

function isRelevantMeetup(title: string, description: string, organizer: string | null, location: string | null): boolean {
  const haystack = [title, description, organizer ?? "", location ?? ""].join(" ").toLowerCase();
  return hasKeyword(haystack, AI_KEYWORDS)
    && (hasKeyword(haystack, SEOUL_KEYWORDS) || hasKeyword(haystack, EVENT_KEYWORDS));
}

function inferTags(title: string, description: string): string[] {
  const haystack = `${title} ${description}`.toLowerCase();
  const kind = /세미나|seminar|conference|컨퍼런스|workshop|워크숍|워크샵/.test(haystack) ? "세미나" : "밋업";
  return ["AI", kind, "서울", "Luma"];
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

export function parseLumaEventFromHtml(url: string, html: string, now = new Date()): Hackathon | null {
  const normalizedUrl = normalizeLumaUrl(url);
  if (!normalizedUrl) return null;

  const text = stripHtml(html);
  const slug = new URL(normalizedUrl).pathname.split("/").filter(Boolean)[0] ?? normalizedUrl;
  const structured = extractStructuredEvent(html);
  const fallbackDates = structured.startsAt ? { startsAt: null, endsAt: null } : parseDateRange(text);
  const startsAt = structured.startsAt ?? fallbackDates.startsAt;
  let endsAt = structured.endsAt ?? fallbackDates.endsAt;

  if (startsAt && !endsAt) {
    endsAt = new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();
  }

  const title = cleanLumaTitle(
    structured.title
      ?? extractMetaContent(html, "og:title")
      ?? extractTitleTag(html)
  );
  const description = buildDescription(html, text, structured);
  const organizer = structured.organizer ?? extractOrganizer(text);
  const location = structured.location ?? extractLocation(text) ?? "서울";
  const thumbnailUrl = structured.thumbnailUrl ?? extractMetaContent(html, "og:image");

  if (!title || !startsAt || !endsAt) return null;
  if (new Date(endsAt) < now) return null;
  if (!isRelevantMeetup(title, description, organizer, location)) return null;

  return {
    source: "luma",
    external_id: slug,
    title,
    description,
    organizer,
    url: normalizedUrl,
    thumbnail_url: thumbnailUrl,
    prize: null,
    tags: inferTags(title, description),
    starts_at: startsAt,
    ends_at: endsAt,
    location,
    category: "meetup",
  };
}

async function parseLumaEvent(url: string): Promise<Hackathon | null> {
  const html = await fetchText(url);
  if (!html) return null;
  return parseLumaEventFromHtml(url, html);
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
