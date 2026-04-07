import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const hackathons = [
  {
    source: "manual",
    external_id: "ai-challenge-4all-2026",
    title: "2026 전국민 AI 경진대회",
    description:
      "초보부터 전문가까지 누구나 참여 가능한 국내 최대 AI 경진대회. AI Champion 트랙 등 다양한 부문으로 구성.",
    organizer: "과학기술정보통신부",
    url: "https://aichallenge4all.or.kr/",
    thumbnail_url: null,
    prize: "총 30억원",
    tags: ["AI", "경진대회", "정부주관"],
    starts_at: "2026-03-26T00:00:00Z",
    ends_at: "2026-11-30T23:59:59Z",
    location: "대한민국",
  },
  {
    source: "manual",
    external_id: "seoul-bigdata-2026",
    title: "2026 서울시 빅데이터 활용 경진대회",
    description:
      "스타트업, 분석, 시각화 3개 부문 통합 경진대회. 서울 공공데이터를 활용한 혁신 아이디어 공모.",
    organizer: "서울특별시",
    url: "https://data.seoul.go.kr",
    thumbnail_url: null,
    prize: "총 2,350만원",
    tags: ["빅데이터", "공공데이터", "스타트업", "데이터분석"],
    starts_at: "2026-03-16T00:00:00Z",
    ends_at: "2026-05-13T23:59:59Z",
    location: "서울",
  },
  {
    source: "manual",
    external_id: "employment-labor-data-ai-2026",
    title: "제5회 고용노동 공공데이터 AI 활용 공모전",
    description:
      "고용노동 공공데이터와 AI를 활용한 아이디어 기획 및 제품/서비스 개발 공모전.",
    organizer: "고용노동부",
    url: "https://www.2026datacontest.co.kr/",
    thumbnail_url: null,
    prize: "대상 400만원",
    tags: ["공공데이터", "AI", "고용", "노동"],
    starts_at: "2026-03-16T00:00:00Z",
    ends_at: "2026-05-14T16:00:00Z",
    location: "대한민국",
  },
  {
    source: "dacon",
    external_id: "dacon-smart-warehouse-2026",
    title: "스마트 창고 출고 지연 예측 AI 경진대회",
    description:
      "스마트 물류 창고 시뮬레이션 데이터를 활용해 향후 30분간 평균 출고 지연시간을 예측하는 AI 모델 개발.",
    organizer: "DACON",
    url: "https://dacon.io/competitions/official/236696/overview/description",
    thumbnail_url: null,
    prize: null,
    tags: ["AI", "머신러닝", "물류", "데이터사이언스"],
    starts_at: "2026-04-07T00:00:00Z",
    ends_at: "2026-05-04T23:59:59Z",
    location: "온라인",
  },
  {
    source: "manual",
    external_id: "sejong-data-ai-2026",
    title: "2026 세종시 데이터 AI 활용 경진대회",
    description:
      "공공데이터·AI 창업(아이디어 기획, 제품/서비스 개발)과 데이터분석 정책제안 2개 분야 3개 부문.",
    organizer: "세종특별자치시",
    url: "https://www.sejong.go.kr",
    thumbnail_url: null,
    prize: null,
    tags: ["공공데이터", "AI", "스타트업", "스마트시티"],
    starts_at: "2026-04-06T00:00:00Z",
    ends_at: "2026-05-29T18:00:00Z",
    location: "세종",
  },
  {
    source: "manual",
    external_id: "edu-data-ai-2026",
    title: "제8회 교육 공공데이터 AI 활용대회",
    description:
      "교육 분야 공공데이터와 AI를 활용한 문제 해결. 초등, 중고등, 일반 부문.",
    organizer: "교육부 / 경상남도교육청",
    url: "https://www.2026edudataaicontest.com/",
    thumbnail_url: null,
    prize: "총 5,050만원",
    tags: ["교육", "공공데이터", "AI", "학생"],
    starts_at: "2026-03-16T00:00:00Z",
    ends_at: "2026-05-31T23:59:59Z",
    location: "대한민국",
  },
  {
    source: "manual",
    external_id: "green-future-asia-hackathon-2026",
    title: "그린 퓨처 2026 아시아 해커톤",
    description:
      "아시아 대학생/대학원생 대상 친환경·탄소중립 솔루션 해커톤. 결선 30팀 하노이 현지 참가 지원.",
    organizer: "빈그룹 / VinUniversity",
    url: "https://greenfuture.vinuni.edu.vn",
    thumbnail_url: null,
    prize: "$24,000 USD",
    tags: ["그린테크", "탄소중립", "아시아", "해커톤"],
    starts_at: "2026-04-06T00:00:00Z",
    ends_at: "2026-07-31T23:59:59Z",
    location: "한국/베트남",
  },
];

async function main() {
  console.log("=== Seeding Active Hackathons ===");

  // First, delete ended hackathons
  const now = new Date().toISOString();
  const { data: deleted, error: deleteError } = await supabase
    .from("hackathons")
    .delete()
    .lt("ends_at", now)
    .select("id");

  if (deleteError) {
    console.error("Delete error:", deleteError.message);
  } else {
    console.log(`Deleted ${deleted?.length ?? 0} ended hackathons`);
  }

  // Upsert new active hackathons
  const { error } = await supabase.from("hackathons").upsert(
    hackathons.map((h) => ({
      ...h,
      collected_at: new Date().toISOString(),
    })),
    { onConflict: "source,external_id" }
  );

  if (error) {
    console.error("Upsert error:", error.message);
  } else {
    console.log(`Upserted ${hackathons.length} active hackathons`);
  }

  console.log("=== Done ===");
}

main().catch(console.error);
