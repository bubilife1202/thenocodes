export type ChallengeKind = "reasoning" | "coding" | "math" | "benchmark";

export interface ChallengeItem {
  id: string;
  title: string;
  sourceName: string;
  url: string;
  kind: ChallengeKind;
  description: string;
  whyTry: string;
  format: string;
  bestFor: string;
  difficulty: "입문" | "중급" | "상급";
  tags: string[];
}

const CHALLENGES: ChallengeItem[] = [
  {
    id: "arc-prize",
    title: "ARC Prize",
    sourceName: "ARC Prize",
    url: "https://arcprize.org/",
    kind: "reasoning",
    description:
      "사람에겐 쉬운데 AI는 자주 헤매는 패턴 추론 문제 모음. 진지한 실험도 되지만, AI 머리 얼마나 아픈지 구경하기에도 좋다.",
    whyTry:
      "에이전트나 추론 모델에게 던져놓고 진짜로 규칙을 찾아내는지 보면 꽤 재밌다. 생각보다 허무하게 틀리는 장면도 자주 나온다.",
    format: "추론 퍼즐 · 벤치마크",
    bestFor: "reasoning 실험, agent 평가, 프롬프트 비교",
    difficulty: "상급",
    tags: ["추론", "벤치마크", "AGI", "패턴인식"],
  },
  {
    id: "erdos-problems",
    title: "Erdős Problems",
    sourceName: "Erdős Problems",
    url: "https://www.erdosproblems.com/",
    kind: "math",
    description:
      "Paul Erdős가 남긴 수학 문제와 난제를 모아둔 데이터베이스. 수학 덕후용이지만, AI한테 던져보면 금방 난이도 체감이 오는 사이트다.",
    whyTry:
      "정답 맞히기보다 AI가 어디서부터 헛소리하기 시작하는지 보기 좋다. 진지한 연구 모드와 이상한 딴짓 모드가 동시에 가능하다.",
    format: "문제 데이터베이스 · 난제 아카이브",
    bestFor: "수학 reasoning 실험, 연구형 프롬프트, 장기 탐색",
    difficulty: "상급",
    tags: ["수학", "난제", "정수론", "조합론"],
  },
  {
    id: "project-euler",
    title: "Project Euler",
    sourceName: "Project Euler",
    url: "https://projecteuler.net/",
    kind: "math",
    description:
      "수학 아이디어랑 코딩을 같이 써야 풀리는 고전 문제 모음. 구현만 잘한다고 안 되고, 발상이 필요해서 AI 놀리기 좋다.",
    whyTry:
      "코드 생성 모델이 그냥 brute force만 하는지, 아니면 진짜로 문제를 단순화하는지 금방 드러난다.",
    format: "수학 + 코딩 문제셋",
    bestFor: "알고리즘 실험, 코드 생성 모델 비교",
    difficulty: "중급",
    tags: ["수학", "알고리즘", "코딩", "문제풀이"],
  },
  {
    id: "advent-of-code",
    title: "Advent of Code",
    sourceName: "Advent of Code",
    url: "https://adventofcode.com/",
    kind: "coding",
    description:
      "매년 12월 열리는 프로그래밍 퍼즐 이벤트. 입력 파싱, 구현, 디버깅까지 다 나와서 AI한테 시키고 구경하기 좋다.",
    whyTry:
      "에이전트에게 파일 읽기부터 반복 디버깅까지 맡겨보면 의외로 사람이 더 답답해지는 순간들이 나온다.",
    format: "시즌형 코딩 퍼즐",
    bestFor: "코딩 에이전트 실험, 반복 디버깅, 생산성 비교",
    difficulty: "중급",
    tags: ["코딩", "퍼즐", "디버깅", "에이전트"],
  },
  {
    id: "leetcode",
    title: "LeetCode",
    sourceName: "LeetCode",
    url: "https://leetcode.com/",
    kind: "coding",
    description:
      "자료구조, 알고리즘, SQL 문제를 폭넓게 다루는 대표적인 코딩 사이트. 가장 무난하게 AI 실력 재보기 좋다.",
    whyTry:
      "AI 코딩 모델의 기본기랑 테스트 통과 안정성을 빠르게 확인할 수 있다. 심심할 때 모델 여러 개 붙여 비교하기도 편하다.",
    format: "코딩 인터뷰 · 알고리즘 문제",
    bestFor: "기본기 테스트, 모델 성능 비교, 코딩 연습",
    difficulty: "입문",
    tags: ["코딩", "알고리즘", "인터뷰", "SQL"],
  },
  {
    id: "swe-bench",
    title: "SWE-bench",
    sourceName: "SWE-bench",
    url: "https://www.swebench.com/",
    kind: "benchmark",
    description:
      "실제 GitHub 이슈를 바탕으로 코드 수정 능력을 보는 벤치마크. 조금 무겁지만, AI한테 진짜 일 시키는 느낌이 난다.",
    whyTry:
      "단순 문제풀이 말고 실제 버그 수정, 테스트 통과, 리포지토리 이해까지 되는지 보고 싶을 때 좋다.",
    format: "실전 코드 수정 벤치마크",
    bestFor: "코딩 에이전트 평가, 실전 개발 워크플로우 테스트",
    difficulty: "상급",
    tags: ["코딩", "버그수정", "benchmark", "GitHub"],
  },
];

export function getChallenges(kind?: ChallengeKind) {
  if (!kind) return CHALLENGES;
  return CHALLENGES.filter((item) => item.kind === kind);
}

export function getFeaturedChallenges(limit = 4) {
  return CHALLENGES.slice(0, limit);
}
