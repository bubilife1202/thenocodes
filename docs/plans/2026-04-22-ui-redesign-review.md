# 2026-04-22 UI Redesign Review & Documentation Notes

이 문서는 `.omx/plans/ralplan-dr-thenocodes-ui-redesign-from-mockups.md` 실행을 리뷰하고 통합할 때 보는 작업 메모다. 목표는 코드 품질, 문서화, 최종 검증 기준을 한 곳에 고정해 여러 worker가 같은 방향으로 변경하도록 돕는 것이다.

## 리디자인 품질 기준

### 공통

- 기존 Next.js App Router 서버 컴포넌트 흐름을 유지한다.
- 데이터 로딩은 현재처럼 route-level server component와 `Promise.all` 병렬화를 우선한다.
- 새 런타임 의존성, UI 라이브러리, 클라이언트 상태 라이브러리는 추가하지 않는다.
- 런타임/조정 상태인 `.omc/`, `.omx/` 파일은 커밋하지 않는다.
- 한국어 카피는 마케팅 과장보다 "무엇을 할 수 있는지"와 "어떤 증거를 보는지"를 먼저 말한다.

### Phase 1: Nav / Home / Metadata

- 사이드바와 모바일 drawer 모두에서 `실전 시나리오`가 보여야 한다.
- 브랜드 설명은 `해커톤·공모전·밋업`만이 아니라 AI 빌더 훈련/실전 시나리오까지 포함해야 한다.
- 홈 첫 화면은 기회 게시판만의 랜딩이 아니라 시나리오 CTA, 운영 지표, 긴급 기회 행을 함께 보여주는 대시보드여야 한다.
- `getHomeData`, `getFeaturedMeetups`, `getFeaturedSignals`, `getStats` 호출은 유지한다.

### Phase 2: `/scenarios`

- `실제 풀이 대화는 이렇게 남깁니다`, `Verification`, `Revision` 문구가 정적 HTML에 포함되어야 한다.
- 말풍선은 "AI 채팅 기능"처럼 보이면 안 된다. 역할 라벨과 설명으로 정적 증거 발췌임을 명확히 한다.
- 기존 가격, FAQ, waitlist query-state 렌더링은 보존한다.

### Phase 3: `/scenarios/walkthrough`

- Collaboration, Verification, Improvement 축별 transcript bubble cluster와 grader interpretation을 분리한다.
- 데스크톱에는 score rail, 모바일에는 inline score summary가 겹치지 않아야 한다.
- 코드/diff 블록은 `overflow-x-auto` 같은 명시적 가로 스크롤 처리를 유지한다.

### Phase 4: `/community`, `/signals`, `/reviews`

- primary list는 dense하고 scan-friendly해야 한다.
- 오른쪽 rail은 weekly top, category/source summary, contribution CTA 등 보조 맥락을 제공한다.
- 제출, 투표, 필터, moderation 관련 action은 변경하지 않는다.
- 모바일에서는 rail이 목록 앞을 가리지 않고 header 아래 또는 list 뒤로 stack되어야 한다.

### Phase 5: `/hackathons`, `/contests`, `/meetups`

- status, deadline/date, organizer, location, source, urgency가 목록 행 안에서 비교 가능해야 한다.
- 기존 query-string 필터 링크 (`?status=active`, `?status=upcoming`)를 유지한다.
- 모바일에서는 무리한 테이블 압축보다 의도적 stack을 허용하되 제목과 deadline은 항상 보이게 한다.

## Code Review Checklist

- [ ] 변경 파일이 계획의 route/file touchpoints 안에 머문다.
- [ ] data fetching 함수의 반환 타입 또는 Supabase query shape가 불필요하게 바뀌지 않았다.
- [ ] `Link`와 외부 `<a target="_blank" rel="noopener noreferrer">` 사용이 기존 패턴과 일치한다.
- [ ] 필터 탭 href가 기존 route/query 의미를 유지한다.
- [ ] mobile drawer, sticky sidebar, two-column rail에서 z-index/overflow 충돌이 없다.
- [ ] static bubble copy가 자동 채점, live chat, 저장 기능을 암시하지 않는다.
- [ ] 빈 상태(`등록된 항목이 없습니다`, `후기가 없습니다`)가 계속 표시된다.
- [ ] `.omc/`, `.omx/`, local screenshot artifacts, temporary logs are excluded from git status.

## Required Verification Matrix

| Check | Command | Expected |
| --- | --- | --- |
| Lint | `npm run lint` | PASS |
| Type check | `npx tsc --noEmit` | PASS |
| Build | `npm run build` | PASS |
| Home smoke | `curl -s http://127.0.0.1:3000/ \| rg "실전 시나리오\|/scenarios"` | PASS after Phase 1 |
| Scenario smoke | `curl -s http://127.0.0.1:3000/scenarios \| rg "실제 풀이 대화는 이렇게 남깁니다\|Verification\|Revision"` | PASS after Phase 2 |
| Walkthrough smoke | `curl -s http://127.0.0.1:3000/scenarios/walkthrough \| rg "Collaboration\|Verification\|Improvement\|L9 / L12"` | PASS after Phase 3 |
| List smoke | `curl -s http://127.0.0.1:3000/community \| rg "커뮤니티"` and same for `/signals`, `/reviews` | PASS after Phase 4 |
| Opportunity smoke | `curl -s "http://127.0.0.1:3000/hackathons?status=active" \| rg "해커톤\|진행중"` and same for contests/meetups | PASS after Phase 5 |

For final visual QA, capture desktop and mobile screenshots for `/`, `/scenarios`, `/scenarios/walkthrough`, `/community`, `/signals`, `/reviews`, `/hackathons`, `/contests`, and `/meetups`. Compare against the mockup patterns for hierarchy and density, not pixel-perfect spacing.

## Known Integration Watchpoints

- The current navigation already contains some non-plan routes such as `/problem-bank`; do not use this redesign task to remove unrelated links unless the leader explicitly assigns that cleanup.
- Home currently depends on live Supabase-backed data; build checks can pass with placeholder admin clients, but route smoke needs a running dev server with the expected local environment.
- `package.json` has no root `test` script. Report that explicitly instead of inventing a test command.
