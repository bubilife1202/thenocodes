import type { Hackathon } from "./types.js";

const DACON_URL = "https://dacon.io/competitions";
const DACON_HOST = "https://dacon.io";
const MAX_DACON_COMPETITIONS = 24;

type DaconCompetitionCard = {
  id: string;
  title: string;
  keyword: string | null;
  thumbnailUrl: string | null;
  statusText: string | null;
};

type DaconDateFields = {
  startsAt: string | null;
  endsAt: string | null;
};

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
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirst(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[1] ? decodeHtmlEntities(match[1]).trim() : null;
}

function normalizeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(decodeHtmlEntities(value), DACON_HOST).toString();
  } catch {
    return null;
  }
}

function normalizeDaconDate(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;

  const isoLike = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(isoLike) ? isoLike : `${isoLike}+09:00`;
  const parsed = new Date(withTimezone);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function readJsStringField(html: string, field: string): string | null {
  const pattern = new RegExp(`${field}:"((?:\\\\.|[^"\\\\])*)"`);
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  return match[1]
    .replace(/\\u002F/g, "/")
    .replace(/\\u003C/g, "<")
    .replace(/\\u003E/g, ">")
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, "\"")
    .replace(/\\n/g, "\n")
    .trim();
}

export function extractDaconDateFields(html: string): DaconDateFields {
  const periodStart = readJsStringField(html, "period_start");
  const periodEnd = readJsStringField(html, "period_end");
  const submissionEnd = readJsStringField(html, "submission_end");

  return {
    startsAt: normalizeDaconDate(periodStart),
    endsAt: normalizeDaconDate(periodEnd ?? submissionEnd),
  };
}

export function extractDaconPrize(html: string): string | null {
  return readJsStringField(html, "prize_info") ?? readJsStringField(html, "prize_text");
}

export function extractDaconCompetitionCards(html: string): DaconCompetitionCard[] {
  const cards: DaconCompetitionCard[] = [];
  const seen = new Set<string>();
  const cardRegex = /<a[^>]+href="\/competitions\/official\/(\d+)\/overview\/"[^>]*>[\s\S]*?<\/a>/gi;

  for (const match of html.matchAll(cardRegex)) {
    const id = match[1];
    const cardHtml = match[0];
    if (!id || seen.has(id)) continue;

    const title = extractFirst(cardHtml, /<p[^>]+class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
      ?? extractFirst(cardHtml, /<img[^>]+alt="([^"]+)"/i);
    if (!title) continue;

    const keyword = extractFirst(cardHtml, /<p[^>]+class="[^"]*keyword[^"]*"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
    const thumbnailUrl = normalizeUrl(extractFirst(cardHtml, /<img[^>]+src="([^"]+)"/i));
    const ddayHtml = cardHtml.match(/<div[^>]+class="[^"]*dday[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "";
    const statusText = ddayHtml ? stripHtml(ddayHtml) : null;

    seen.add(id);
    cards.push({ id, title, keyword, thumbnailUrl, statusText });
  }

  return cards;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNocodesBot/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      console.error(`[Dacon] Fetch failed: ${url} (${res.status})`);
      return null;
    }

    return res.text();
  } catch (err) {
    console.error(`[Dacon] Fetch error: ${url}`, err);
    return null;
  }
}

function buildTags(card: DaconCompetitionCard) {
  const keywordTags = card.keyword
    ? card.keyword.split("|").map((tag) => tag.trim()).filter(Boolean)
    : [];
  return Array.from(new Set(["AI", "공모전", "DACON", ...keywordTags]));
}

function isEndedStatusText(statusText: string | null | undefined) {
  return Boolean(statusText?.includes("마감") || statusText?.includes("종료"));
}

export function shouldKeepDaconCompetition(
  dates: DaconDateFields,
  statusText: string | null | undefined,
  now = new Date(),
) {
  if (!dates.endsAt) return false;
  if (isEndedStatusText(statusText)) return false;
  return new Date(dates.endsAt) >= now;
}

export async function collectDacon(): Promise<Hackathon[]> {
  const competitions: Hackathon[] = [];

  try {
    const html = await fetchText(DACON_URL);
    if (!html) return [];

    const cards = extractDaconCompetitionCards(html).slice(0, MAX_DACON_COMPETITIONS);
    const now = new Date();

    const detailed = await Promise.all(cards.map(async (card) => {
      const url = `${DACON_HOST}/competitions/official/${card.id}/overview/`;
      const detailHtml = await fetchText(url);
      const dates = detailHtml ? extractDaconDateFields(detailHtml) : { startsAt: null, endsAt: null };
      const prize = detailHtml ? extractDaconPrize(detailHtml) : null;
      return { card, url, dates, prize };
    }));

    for (const { card, url, dates, prize } of detailed) {
      if (!shouldKeepDaconCompetition(dates, card.statusText, now)) continue;

      competitions.push({
        source: "dacon",
        external_id: card.id,
        title: card.title,
        description: card.keyword ?? "",
        organizer: "DACON",
        url,
        thumbnail_url: card.thumbnailUrl,
        prize,
        tags: buildTags(card),
        starts_at: dates.startsAt,
        ends_at: dates.endsAt,
        location: "Online",
        category: "contest",
      });
    }
  } catch (err) {
    console.error("[Dacon] Error:", err);
  }

  console.log(`[Dacon] Collected ${competitions.length} competitions`);
  return competitions;
}
