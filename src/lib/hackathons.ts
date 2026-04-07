export type HackathonStatus = "upcoming" | "active" | "ended";

export interface HackathonLike {
  source: string;
  title: string;
  description: string | null;
  organizer: string | null;
  tags: string[];
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  url: string;
}

const KOREAN_SOURCES = new Set(["eventus", "dacon"]);
const KOREAN_KEYWORDS = [
  "korea",
  "south korea",
  "seoul",
  "busan",
  "incheon",
  "daejeon",
  "daegu",
  "ulsan",
  "gyeonggi",
  "jeju",
  "대한민국",
  "한국",
  "서울",
  "부산",
  "인천",
  "대전",
  "대구",
  "울산",
  "경기",
  "제주",
  "세종",
  "강원",
  "충청",
  "전라",
  "경상",
  "해커톤",
];

function toTimestamp(value: string | null, fallback: number) {
  if (!value) return fallback;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? fallback : timestamp;
}

function compareByStatusWindow(
  a: HackathonLike,
  b: HackathonLike,
  status: HackathonStatus,
) {
  if (status === "active") {
    return toTimestamp(a.ends_at, Number.POSITIVE_INFINITY) - toTimestamp(b.ends_at, Number.POSITIVE_INFINITY);
  }

  if (status === "upcoming") {
    return toTimestamp(a.starts_at, Number.POSITIVE_INFINITY) - toTimestamp(b.starts_at, Number.POSITIVE_INFINITY);
  }

  return toTimestamp(b.ends_at, Number.NEGATIVE_INFINITY) - toTimestamp(a.ends_at, Number.NEGATIVE_INFINITY);
}

export function getHackathonStatus(hackathon: Pick<HackathonLike, "starts_at" | "ends_at">, now = new Date()): HackathonStatus {
  if (hackathon.starts_at && new Date(hackathon.starts_at) > now) return "upcoming";
  if (hackathon.ends_at && new Date(hackathon.ends_at) < now) return "ended";
  return "active";
}

export function isKoreanHackathon(hackathon: HackathonLike) {
  if (KOREAN_SOURCES.has(hackathon.source)) return true;

  const haystack = [
    hackathon.title,
    hackathon.description,
    hackathon.organizer,
    hackathon.location,
    hackathon.url,
    ...(hackathon.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return KOREAN_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export function sortHackathons<T extends HackathonLike>(
  hackathons: T[],
  now = new Date(),
  filter?: HackathonStatus,
) {
  const priority: Record<HackathonStatus, number> = { active: 0, upcoming: 1, ended: 2 };

  return [...hackathons].sort((a, b) => {
    const statusA = getHackathonStatus(a, now);
    const statusB = getHackathonStatus(b, now);

    if (filter) {
      return compareByStatusWindow(a, b, filter);
    }

    if (statusA !== statusB) {
      return priority[statusA] - priority[statusB];
    }

    return compareByStatusWindow(a, b, statusA);
  });
}
