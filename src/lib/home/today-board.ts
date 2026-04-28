export interface TodayActivityItem {
  id: string;
  title: string;
  href: string;
  source: string;
  timestamp: string | null | undefined;
  meta?: string;
  tone?: "teal" | "orange" | "purple" | "neutral";
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseTimestamp(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatKstActivityTime(value: string | Date | null | undefined) {
  const timestamp = parseTimestamp(value);
  if (!timestamp) return "수집 대기";

  const kstDate = new Date(timestamp.getTime() + KST_OFFSET_MS);
  const hours = String(kstDate.getUTCHours()).padStart(2, "0");
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes} KST`;
}

export function getKstDayStart(now = new Date()) {
  const kstTime = now.getTime() + KST_OFFSET_MS;
  const kstDayStart = Math.floor(kstTime / DAY_MS) * DAY_MS;
  return new Date(kstDayStart - KST_OFFSET_MS);
}

export function getLatestActivityAt(items: TodayActivityItem[]) {
  let latest: Date | null = null;

  for (const item of items) {
    const timestamp = parseTimestamp(item.timestamp);
    if (!timestamp) continue;
    if (!latest || timestamp > latest) latest = timestamp;
  }

  return latest;
}

export function buildTodayActivity(items: TodayActivityItem[], now = new Date(), limit = 6) {
  const dayStart = getKstDayStart(now).getTime();
  const dayEnd = dayStart + DAY_MS;

  return items
    .map((item) => ({ item, timestamp: parseTimestamp(item.timestamp) }))
    .filter(({ timestamp }) => {
      if (!timestamp) return false;
      const time = timestamp.getTime();
      return time >= dayStart && time < dayEnd;
    })
    .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime())
    .slice(0, limit)
    .map(({ item }) => item);
}
