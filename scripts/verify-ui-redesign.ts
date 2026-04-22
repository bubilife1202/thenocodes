import { readFileSync } from "node:fs";
import { join } from "node:path";

const checks: Array<{ file: string; includes: string[] }> = [
  {
    file: "src/components/layout/site-navigation.tsx",
    includes: ["실전 시나리오", "/scenarios", "AI 빌더 역량"],
  },
  {
    file: "src/app/page.tsx",
    includes: ["실전 시나리오 보기", "정적 대화 증거", "/scenarios/walkthrough", "해커톤 · 공모전 비교"],
  },
  {
    file: "src/app/scenarios/page.tsx",
    includes: ["실제 풀이 대화는 이렇게 남깁니다", "Verification", "Revision", "라이브 채팅 UI가 아니라"],
  },
  {
    file: "src/app/scenarios/walkthrough/page.tsx",
    includes: ["Rubric score rail", "Collaboration", "Verification", "Improvement", "L9 / L12"],
  },
  {
    file: "src/app/community/page.tsx",
    includes: ["builder community", "이번 주 인기", "lg:grid-cols-[minmax(0,1fr)_300px]"],
  },
  {
    file: "src/app/signals/page.tsx",
    includes: ["builder signals", "소스 읽는 순서", "lg:grid-cols-[minmax(0,1fr)_300px]"],
  },
  {
    file: "src/app/reviews/page.tsx",
    includes: ["builder reviews", "후기 프롬프트", "후기 작성"],
  },
  {
    file: "src/app/hackathons/page.tsx",
    includes: ["opportunity comparison", "진행중", "HackathonTable"],
  },
  {
    file: "src/app/contests/page.tsx",
    includes: ["opportunity comparison", "모집중", "ContestTable"],
  },
  {
    file: "src/app/meetups/page.tsx",
    includes: ["opportunity comparison", "장소 · 일정 · 시간 · 주최 · 소스", "MeetupTable"],
  },
];

let failures = 0;
for (const check of checks) {
  const body = readFileSync(join(process.cwd(), check.file), "utf8");
  for (const expected of check.includes) {
    if (!body.includes(expected)) {
      console.error(`FAIL ${check.file}: missing ${JSON.stringify(expected)}`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`PASS ui-redesign static acceptance checks (${checks.length} files)`);
