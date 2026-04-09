import { getMeetups as getMeetupsFromDB } from "@/lib/data/hackathons";
import { sortHackathons, type HackathonStatus } from "@/lib/hackathons";
import type { HackathonRow } from "@/lib/data/hackathons";

// Fallback curated meetups — used when DB has no meetup rows yet.
// Remove this once Luma collector or manual DB entry is in place.
const CURATED_MEETUPS: HackathonRow[] = [
  {
    id: "meetup-luma-cafe-lagrange-2026-04-15",
    source: "luma",
    external_id: "1pmns80d",
    title: "Cafe Lagrange — with OpenGradient & Sentient",
    description:
      "강남 카페 큐리어스에서 열리는 서울 AI 커뮤니티 팝업 밋업. OpenGradient, Sentient, Lagrange가 참여하고 창업자·빌더·리서처 네트워킹 중심으로 진행됩니다.",
    organizer: "Lagrange · OpenGradient · Sentient",
    url: "https://luma.com/1pmns80d",
    thumbnail_url: null,
    prize: null,
    tags: ["AI", "밋업", "서울", "강남", "Luma"],
    starts_at: "2026-04-15T02:00:00.000Z",
    ends_at: "2026-04-15T12:00:00.000Z",
    location: "카페 큐리어스, 서울 강남구 도산대로 430",
    collected_at: "2026-04-08T05:14:23.194Z",
    category: "meetup",
  },
  {
    id: "meetup-luma-ai-infracon-2026-04-15",
    source: "luma",
    external_id: "8nzr1zec",
    title: "AI/InfraCon",
    description:
      "드림플러스 강남에서 열리는 AI·Web3 인프라 중심 세미나/네트워킹 이벤트. AI Agents, RWA, Stablecoins 등 실제 프로덕션 적용 사례를 다룹니다.",
    organizer: "Catalyze",
    url: "https://luma.com/8nzr1zec",
    thumbnail_url: null,
    prize: null,
    tags: ["AI", "세미나", "서울", "강남", "Luma"],
    starts_at: "2026-04-15T09:00:00.000Z",
    ends_at: "2026-04-15T13:00:00.000Z",
    location: "드림플러스 강남, 서울",
    collected_at: "2026-04-08T05:14:23.108Z",
    category: "meetup",
  },
  {
    id: "meetup-fastcampus-openai-senior-2026-05-08",
    source: "manual",
    external_id: "fastcampus-openai-2026-05-08",
    title: "OpenAI와 함께하는 5060 시니어 AI 교육 행사",
    description:
      "OpenAI와 패스트캠퍼스가 함께 여는 오프라인 AI 교육 행사. 5060 시니어를 대상으로 재취업 설계와 사업 운영에 맞는 AI 활용 실습을 진행합니다.",
    organizer: "OpenAI · 패스트캠퍼스",
    url: "https://fastcampus.co.kr/openai",
    thumbnail_url: null,
    prize: null,
    tags: ["AI", "교육", "세미나", "오프라인", "서울", "시니어", "FastCampus"],
    starts_at: "2026-05-08T04:00:00.000Z",
    ends_at: "2026-05-08T08:00:00.000Z",
    location: "신촌(오프라인), 서울",
    collected_at: "2026-04-08T08:40:00.000Z",
    category: "meetup",
  },
];

export async function getMeetups(filter?: HackathonStatus) {
  // Try DB first, fall back to curated list
  const dbMeetups = await getMeetupsFromDB(filter);
  if (dbMeetups.length > 0) return dbMeetups;

  // Fallback: curated hardcoded meetups
  const now = new Date();
  const filtered = filter
    ? CURATED_MEETUPS.filter((row) => {
        const start = row.starts_at ? new Date(row.starts_at) : null;
        const end = row.ends_at ? new Date(row.ends_at) : null;
        if (filter === "upcoming") return !!start && start > now;
        if (filter === "ended") return !!end && end < now;
        return (!start || start <= now) && (!end || end >= now);
      })
    : CURATED_MEETUPS;

  return sortHackathons(filtered, now, filter);
}

export async function getFeaturedMeetups(limit = 2) {
  const meetups = await getMeetups();
  return meetups.slice(0, limit);
}
