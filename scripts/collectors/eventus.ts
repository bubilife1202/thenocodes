import type { Hackathon } from "./types.js";

const EVENTUS_API = "https://api.event-us.kr/api/v1/engine/search";
const MAX_PAGES_PER_QUERY = 5;

type OpportunityCategory = NonNullable<Hackathon["category"]>;

type EventUsQuery = {
  query: string;
  fallbackCategory: OpportunityCategory;
  tags: string[];
};

const EVENTUS_QUERIES: EventUsQuery[] = [
  { query: "AI 해커톤", fallbackCategory: "hackathon", tags: ["AI", "해커톤"] },
  { query: "인공지능 해커톤", fallbackCategory: "hackathon", tags: ["인공지능", "해커톤"] },
  { query: "노코드 해커톤", fallbackCategory: "hackathon", tags: ["노코드", "해커톤"] },
  { query: "AI 공모전", fallbackCategory: "contest", tags: ["AI", "공모전"] },
  { query: "인공지능 공모전", fallbackCategory: "contest", tags: ["인공지능", "공모전"] },
  { query: "AI 경진대회", fallbackCategory: "contest", tags: ["AI", "경진대회"] },
  { query: "AI 밋업", fallbackCategory: "meetup", tags: ["AI", "밋업"] },
  { query: "인공지능 밋업", fallbackCategory: "meetup", tags: ["인공지능", "밋업"] },
  { query: "AI 세미나", fallbackCategory: "meetup", tags: ["AI", "세미나"] },
  { query: "생성형 AI 세미나", fallbackCategory: "meetup", tags: ["생성형 AI", "세미나"] },
  { query: "노코드 세미나", fallbackCategory: "meetup", tags: ["노코드", "세미나"] },
];

const CATEGORY_TAG: Record<OpportunityCategory, string> = {
  hackathon: "해커톤",
  contest: "공모전",
  meetup: "밋업",
};

const CONTEST_TERMS = ["공모전", "경진대회", "콘테스트", "competition", "contest", "challenge"];
const MEETUP_TERMS = ["밋업", "세미나", "웨비나", "컨퍼런스", "포럼", "강연", "워크숍", "meetup", "seminar", "webinar", "conference", "workshop"];
const HACKATHON_TERMS = ["해커톤", "hackathon"];

function rawValue(value: unknown): string | null {
  if (value && typeof value === "object" && "raw" in value) {
    const raw = (value as { raw?: unknown }).raw;
    return typeof raw === "string" || typeof raw === "number" ? String(raw) : null;
  }
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function rawArray(value: unknown): string[] {
  if (value && typeof value === "object" && "raw" in value) {
    const raw = (value as { raw?: unknown }).raw;
    if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
    if (typeof raw === "string") return [raw].filter(Boolean);
  }
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

function hasAny(haystack: string, terms: string[]) {
  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

export function classifyEventUsCategory(input: {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  fallbackCategory: OpportunityCategory;
}): OpportunityCategory {
  const haystack = [input.title, input.description, ...(input.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (hasAny(haystack, CONTEST_TERMS)) return "contest";
  if (hasAny(haystack, MEETUP_TERMS)) return "meetup";
  if (hasAny(haystack, HACKATHON_TERMS)) return "hackathon";
  return input.fallbackCategory;
}

function normalizeThumbnail(coverImage: string | null) {
  if (!coverImage) return null;
  return coverImage.startsWith("http")
    ? coverImage
    : `https://eventusstorage.blob.core.windows.net/evs${coverImage}`;
}

export function buildEventUrl(subdomain: string | null, id: string) {
  return subdomain ? `https://event-us.kr/${subdomain}/event/${id}` : `https://event-us.kr/event/${id}`;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function hasUsableEventUsSchedule(input: {
  category: OpportunityCategory;
  startsAt: string | null | undefined;
  endsAt: string | null | undefined;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const start = parseDate(input.startsAt);
  const end = parseDate(input.endsAt);

  if (!start && !end) return false;
  if (end && end < now) return false;

  if (input.category === "meetup") {
    if (end) return true;
    return Boolean(start && start >= now);
  }

  return Boolean(end);
}

async function fetchEventUsPage(query: EventUsQuery, page: number) {
  const res = await fetch(EVENTUS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query.query,
      page: { current: page, size: 20 },
    }),
  });

  if (!res.ok) {
    console.error(`[EventUs] ${query.query} page ${page} failed: ${res.status}`);
    return null;
  }

  return res.json() as Promise<{ results?: unknown[] }>;
}

export async function collectEventUs(): Promise<Hackathon[]> {
  const opportunities: Hackathon[] = [];
  const seen = new Set<string>();
  const now = new Date();

  try {
    for (const query of EVENTUS_QUERIES) {
      for (let page = 1; page <= MAX_PAGES_PER_QUERY; page++) {
        const data = await fetchEventUsPage(query, page);
        const items = data?.results ?? [];

        if (items.length === 0) break;

        for (const item of items) {
          if (!item || typeof item !== "object") continue;
          const e = item as Record<string, unknown>;
          const id = rawValue(e.id);
          if (!id || seen.has(id)) continue;

          const title = rawValue(e.title)?.trim() ?? "";
          const state = rawValue(e.state);
          const subdomain = rawValue(e.subdomain);

          if (!title || state === "Temp" || state === "unpublished") continue;

          const startsAt = rawValue(e.start_date);
          const endsAt = rawValue(e.close_date);
          if (endsAt && new Date(endsAt) < now) continue;

          const description = rawValue(e.description)?.trim() ?? "";
          const eventTags = rawArray(e.tags);
          const category = classifyEventUsCategory({
            title,
            description,
            tags: eventTags,
            fallbackCategory: query.fallbackCategory,
          });

          if (!hasUsableEventUsSchedule({ category, startsAt, endsAt, now })) continue;

          const tags = Array.from(new Set([...eventTags, ...query.tags, CATEGORY_TAG[category]])).filter(Boolean);

          seen.add(id);
          opportunities.push({
            source: "eventus",
            external_id: id,
            title,
            description: description.slice(0, 300),
            organizer: rawValue(e.app_title) ?? rawValue(e.fullname),
            url: buildEventUrl(subdomain, id),
            thumbnail_url: normalizeThumbnail(rawValue(e.cover_image_url)),
            prize: null,
            tags,
            starts_at: startsAt,
            ends_at: endsAt,
            location: rawValue(e.area) ?? rawValue(e.area_detail),
            category,
          });
        }
      }
    }
  } catch (err) {
    console.error("[EventUs] Error:", err);
  }

  console.log(`[EventUs] Collected ${opportunities.length} opportunities`);
  return opportunities;
}
