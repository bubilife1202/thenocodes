export type ChallengeKind = "prototype" | "docs" | "visual" | "audio";
export type ChallengeKoreanSupport = "full" | "partial" | "english-only";
export type ChallengePricingTier = "free" | "freemium" | "paid";

export interface ChallengeRecipe {
  scenario: string;
  prompt: string;
  expectedTime: string;
  resultHint: string;
}

export interface ChallengeItem {
  id: string;
  title: string;
  sourceName: string;
  url: string;
  kind: ChallengeKind;
  description: string;
  useCase: string;
  friction: "즉시 사용" | "계정 필요" | "조금 탐색";
  koreanSupport: ChallengeKoreanSupport;
  pricingTier: ChallengePricingTier;
  tags: string[];
  recipes: ChallengeRecipe[];
  ctaLabel?: string;
}

const CHALLENGES: ChallengeItem[] = [
  {
    id: "chatgpt",
    title: "ChatGPT",
    sourceName: "OpenAI",
    url: "https://chatgpt.com/",
    kind: "docs",
    description: "문서 초안, 요약, 아이디어 정리, 업무용 러프 작업을 가장 빠르게 처리하는 범용 도구.",
    useCase: "제안서 초안, 회의 요약, 메일 문안, 리서치 정리처럼 3시 문제를 빨리 치우는 데 강하다.",
    friction: "즉시 사용",
    koreanSupport: "full",
    pricingTier: "freemium",
    tags: ["요약", "문서초안", "업무자동화"],
    recipes: [
      {
        scenario: "주간 회의록 요약",
        prompt: "아래 회의록을 5줄 요약, 핵심 결정 3개, 담당자별 액션아이템으로 정리해줘.",
        expectedTime: "2분",
        resultHint: "슬랙에 바로 붙여넣을 수 있는 요약본",
      },
      {
        scenario: "제안서 첫 문단 초안",
        prompt: "우리 서비스의 문제 정의, 고객, 기대효과를 300자 제안서 톤으로 써줘.",
        expectedTime: "3분",
        resultHint: "보고서 첫 페이지 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "claude",
    title: "Claude",
    sourceName: "Anthropic",
    url: "https://claude.ai/",
    kind: "docs",
    description: "긴 문서 읽기와 구조화, 차분한 리라이트에 강한 문서형 AI 워크벤치.",
    useCase: "긴 기획안, 리서치 메모, 정책 문서 검토처럼 문맥을 놓치면 안 되는 작업에 적합하다.",
    friction: "즉시 사용",
    koreanSupport: "full",
    pricingTier: "freemium",
    tags: ["문서리뷰", "장문요약", "리라이트"],
    recipes: [
      {
        scenario: "긴 제안서 정리",
        prompt: "이 문서를 임원 보고용 1페이지 구조로 다시 정리하고, 중복 표현은 줄여줘.",
        expectedTime: "4분",
        resultHint: "장문을 짧고 읽히게 정리한 버전",
      },
      {
        scenario: "정책 문구 다듬기",
        prompt: "딱딱한 운영 정책 문구를 사용자 공지 톤으로 부드럽게 바꿔줘.",
        expectedTime: "3분",
        resultHint: "공지용 문안 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "perplexity",
    title: "Perplexity",
    sourceName: "Perplexity",
    url: "https://www.perplexity.ai/",
    kind: "docs",
    description: "검색과 요약을 같이 처리해서 빠르게 사실관계를 잡는 조사형 도구.",
    useCase: "경쟁사 체크, 시장 리서치, 행사/서비스 기본 파악처럼 답보다 출처가 중요한 작업에 좋다.",
    friction: "즉시 사용",
    koreanSupport: "full",
    pricingTier: "freemium",
    tags: ["리서치", "경쟁사", "출처기반"],
    recipes: [
      {
        scenario: "경쟁사 빠른 스캔",
        prompt: "한국 AI 교육 서비스 5개를 비교하고 가격, 타깃, 차별점을 표 없이 요약해줘. 출처도 붙여줘.",
        expectedTime: "5분",
        resultHint: "회의 전 빠른 리서치 메모",
      },
      {
        scenario: "행사 조사",
        prompt: "다음 행사 정보를 찾아 날짜, 장소, 주최, 참가 포인트만 정리해줘.",
        expectedTime: "3분",
        resultHint: "공유용 행사 브리프",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "gamma",
    title: "Gamma",
    sourceName: "Gamma",
    url: "https://gamma.app/",
    kind: "docs",
    description: "텍스트를 슬라이드나 설명형 문서로 빠르게 바꾸는 발표 보조 도구.",
    useCase: "갑자기 필요한 내부 공유 자료, 요약 덱, 데모 설명 슬라이드에 바로 쓰기 좋다.",
    friction: "계정 필요",
    koreanSupport: "full",
    pricingTier: "freemium",
    tags: ["슬라이드", "발표자료", "요약덱"],
    recipes: [
      {
        scenario: "10분 공유용 덱 만들기",
        prompt: "아래 기획 메모를 6장짜리 내부 공유 슬라이드 구조로 바꿔줘.",
        expectedTime: "4분",
        resultHint: "발표 가능한 초안 덱",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "notion-ai",
    title: "Notion AI",
    sourceName: "Notion",
    url: "https://www.notion.so/product/ai",
    kind: "docs",
    description: "노션 문서 안에서 바로 요약, 정리, 초안 작성을 이어갈 수 있는 협업형 AI.",
    useCase: "회의록, 운영 문서, 위키 업데이트처럼 이미 노션에서 일하는 팀에 특히 편하다.",
    friction: "계정 필요",
    koreanSupport: "full",
    pricingTier: "paid",
    tags: ["노션", "회의록", "위키"],
    recipes: [
      {
        scenario: "회의록 정리 후 위키 반영",
        prompt: "이 회의록에서 결정사항과 다음 액션만 추려서 팀 위키 형식으로 정리해줘.",
        expectedTime: "3분",
        resultHint: "문서 안에서 바로 정리 완료",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "v0",
    title: "v0",
    sourceName: "Vercel",
    url: "https://v0.app/",
    kind: "prototype",
    description: "텍스트로 UI 시안을 빠르게 만들고 방향만 먼저 잡을 수 있는 프로토타입 도구.",
    useCase: "랜딩 초안, 내부 데모 화면, 신규 기능 아이디어 검토에 가장 빠르게 반응한다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["UI시안", "랜딩", "프로토타입"],
    recipes: [
      {
        scenario: "신규 기능 랜딩 시안",
        prompt: "B2B SaaS 신규 기능 소개용 한 페이지 랜딩을 깔끔한 SaaS 톤으로 만들어줘.",
        expectedTime: "5분",
        resultHint: "회의에서 바로 보여줄 수 있는 화면 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "bolt",
    title: "Bolt",
    sourceName: "StackBlitz",
    url: "https://bolt.new/",
    kind: "prototype",
    description: "프롬프트로 앱 초안을 생성하고 바로 수정 흐름까지 이어가는 프로토타이핑 도구.",
    useCase: "작동하는 데모, 간단한 내부 툴, 실험용 MVP를 빨리 보여줘야 할 때 강하다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["앱초안", "MVP", "데모"],
    recipes: [
      {
        scenario: "사내 요청 접수 앱 초안",
        prompt: "팀 요청을 등록하고 상태를 보는 간단한 내부 툴 화면을 만들어줘.",
        expectedTime: "7분",
        resultHint: "작동하는 데모 수준의 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "lovable",
    title: "Lovable",
    sourceName: "Lovable",
    url: "https://lovable.dev/",
    kind: "prototype",
    description: "앱 아이디어를 빠르게 제품처럼 보이게 만드는 빌더형 생성 도구.",
    useCase: "아이디어를 말로만 설명하지 않고, 바로 화면으로 보여줘야 할 때 설득력이 좋다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["제품초안", "프로토타입", "설득용"],
    recipes: [
      {
        scenario: "아이디어 검증용 데모",
        prompt: "팀 일정 공유와 리마인드를 한 화면에서 보는 앱 초안을 만들어줘.",
        expectedTime: "6분",
        resultHint: "피드백 받기 좋은 제품형 시안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "cursor",
    title: "Cursor",
    sourceName: "Cursor",
    url: "https://cursor.com/",
    kind: "prototype",
    description: "개발자가 문서와 코드 사이를 오가며 빠르게 구현 실험을 할 때 좋은 코드 워크벤치.",
    useCase: "프론트엔드 수정, 자동 리팩토링, 작은 기능 구현처럼 바로 손대는 작업에 맞는다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["코드", "개발도구", "자동수정"],
    recipes: [
      {
        scenario: "작은 기능 빠른 구현",
        prompt: "기존 프로젝트에 필터 탭 UI를 추가하고 타입 에러 없이 정리해줘.",
        expectedTime: "10분",
        resultHint: "리뷰 가능한 코드 변경 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "websim",
    title: "Websim",
    sourceName: "Websim",
    url: "https://websim.com/",
    kind: "prototype",
    description: "짧은 설명으로 콘셉트 웹페이지를 휙 만들어 방향성만 빠르게 확인하는 도구.",
    useCase: "메신저 공유용 더미 페이지, 콘셉트 설명, 내부 아이디어 시각화에 가볍게 좋다.",
    friction: "조금 탐색",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["콘셉트", "더미페이지", "빠른시안"],
    recipes: [
      {
        scenario: "서비스 콘셉트 페이지",
        prompt: "새로운 커뮤니티 서비스 소개 페이지를 트렌디한 SaaS 느낌으로 만들어줘.",
        expectedTime: "4분",
        resultHint: "대화용 콘셉트 시안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "napkin",
    title: "Napkin AI",
    sourceName: "Napkin AI",
    url: "https://www.napkin.ai/",
    kind: "docs",
    description: "텍스트를 다이어그램과 설명용 비주얼로 바꿔서 문서 이해도를 높여주는 도구.",
    useCase: "프로세스 설명, 운영 구조, 발표용 한 장 요약처럼 글을 그림으로 바꾸고 싶을 때 유용하다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["다이어그램", "프로세스", "발표자료"],
    recipes: [
      {
        scenario: "온보딩 프로세스 도식화",
        prompt: "신입 온보딩 절차를 단계별 흐름도로 바꿔줘.",
        expectedTime: "3분",
        resultHint: "한 장짜리 설명 이미지",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "ideogram",
    title: "Ideogram",
    sourceName: "Ideogram",
    url: "https://ideogram.ai/",
    kind: "visual",
    description: "텍스트가 들어가는 포스터나 썸네일 시안에 비교적 강한 이미지 생성 도구.",
    useCase: "배너 초안, 행사 포스터, SNS 썸네일처럼 글자 포함 비주얼이 필요한 순간에 쓸 만하다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["포스터", "썸네일", "텍스트이미지"],
    recipes: [
      {
        scenario: "행사 포스터 초안",
        prompt: "세련된 AI 밋업 포스터를 만들고 제목 영역이 잘 보이게 구성해줘.",
        expectedTime: "4분",
        resultHint: "내부 검토용 키비주얼 초안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "krea",
    title: "Krea",
    sourceName: "Krea",
    url: "https://www.krea.ai/",
    kind: "visual",
    description: "이미지와 영상 시안을 빠르게 여러 방향으로 뽑아보는 크리에이티브 도구.",
    useCase: "무드보드, 광고 콘셉트, 짧은 비주얼 샘플처럼 감을 먼저 봐야 할 때 편하다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "freemium",
    tags: ["무드보드", "비주얼시안", "광고콘셉트"],
    recipes: [
      {
        scenario: "광고 무드보드 만들기",
        prompt: "미니멀하고 세련된 AI 브랜드 무드보드 이미지를 3가지 방향으로 만들어줘.",
        expectedTime: "5분",
        resultHint: "디자인 논의용 비주얼 묶음",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
  {
    id: "imagefx",
    title: "ImageFX",
    sourceName: "Google Labs",
    url: "https://labs.google/fx/tools/image-fx",
    kind: "visual",
    description: "빠르게 이미지 콘셉트를 테스트해보는 생성형 이미지 도구.",
    useCase: "발표용 삽화, 배너 목업, 키비주얼 방향 검토처럼 초안 속도가 중요할 때 무난하다.",
    friction: "계정 필요",
    koreanSupport: "partial",
    pricingTier: "free",
    tags: ["키비주얼", "삽화", "배너초안"],
    recipes: [
      {
        scenario: "발표 첫 장 비주얼",
        prompt: "AI 커뮤니티 발표 첫 장에 어울리는 미래적이지만 따뜻한 비주얼을 만들어줘.",
        expectedTime: "4분",
        resultHint: "슬라이드 커버 시안",
      },
    ],
    ctaLabel: "도구 열기 →",
  },
];

export function getChallenges(kind?: ChallengeKind) {
  if (!kind) return CHALLENGES;
  return CHALLENGES.filter((item) => item.kind === kind);
}

export function getFeaturedChallenges(limit = 4) {
  return CHALLENGES.slice(0, limit);
}

function getSeoulDateKey(referenceDate = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(referenceDate);
}

export function getDailyChallenge(referenceDate = new Date()) {
  const key = getSeoulDateKey(referenceDate);
  const seed = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const item = CHALLENGES[seed % CHALLENGES.length];
  const recipe = item.recipes[seed % item.recipes.length];
  return { item, recipe };
}
