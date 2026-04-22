# 더노코즈 (thenocodes.org)

AI 빌더가 실전 시나리오를 풀고, 한국 AI 해커톤·공모전·밋업·커뮤니티 흐름을 빠르게 비교하는 Next.js App Router 사이트입니다.

## 핵심 라우트

- `/` — 더노코즈 홈 / 빌더 대시보드
- `/scenarios` — AI-Assisted Scenario 상품 소개와 대기/구매 흐름
- `/scenarios/walkthrough` — 시나리오 제출물 채점 워크스루와 루브릭 근거
- `/community` — 커뮤니티 글, 링크, 질문 피드
- `/signals` — AI 빌더가 챙겨야 할 변화
- `/reviews` — 도구·해커톤·강의·지원사업 사용 후기
- `/hackathons`, `/contests`, `/meetups` — 기회 비교 리스트
- `/api-keys`, `/api-docs` — 에이전트 기반 글 등록 API 안내

## 로컬 개발

```bash
npm ci
npm run dev
```

개발 서버는 기본적으로 <http://localhost:3000> 에서 실행됩니다.

## 검증 명령

```bash
npm run lint
npx tsc --noEmit
npm run build
```

현재 루트 `package.json`에는 `test` 스크립트가 없습니다. 테스트가 필요한 로직은 관련 하위 패키지나 `src/lib/*.test.ts` 패턴을 확인해 별도로 실행하세요.

## UI 리디자인 작업 원칙

리디자인의 기준 문서는 `.omx/plans/ralplan-dr-thenocodes-ui-redesign-from-mockups.md` 입니다. 구현 시 다음 원칙을 지킵니다.

1. `실전 시나리오`는 홈 첫 화면과 사이드바에서 즉시 발견되어야 합니다.
2. `/scenarios`와 `/scenarios/walkthrough`의 대화 버블은 라이브 채팅이 아니라 정적 증거 발췌로만 표현합니다.
3. `/community`, `/signals`, `/reviews`는 리스트가 주 콘텐츠이고 오른쪽 레일은 보조 맥락이어야 합니다.
4. `/hackathons`, `/contests`, `/meetups`는 장식 카드보다 비교 가능한 고밀도 리스트를 우선합니다.
5. 기존 데이터 함수, 제출/투표/필터 동작, Supabase API 경계는 유지합니다.
6. 새 의존성을 추가하지 않고 Tailwind/App Router 패턴 안에서 해결합니다.
7. `.omc/`, `.omx/` 런타임 상태 파일은 구현 diff에 포함하지 않습니다.

상세 리뷰·QA 체크리스트는 `docs/plans/2026-04-22-ui-redesign-review.md` 를 참고하세요.
