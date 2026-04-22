# Scenario #1 — 깨진 미팅 날짜 포매터 고치기

더노코즈 AI-Assisted Scenario #1 스타터 패키지.

이 패키지는 `formatMeetupDate()` 유틸 함수와 테스트 스위트를 포함한다.
테스트 3개 중 1개가 실패하도록 의도적으로 버그가 심어져 있다. 통과하는 2개 테스트에도 숨은 경계 버그가 가려져 있으므로, AI와 함께 원인을 찾고 직접 검증해야 한다.

## 시작하기

```bash
npm ci
npm test
```

처음 실행한 `npm test`는 3개 중 1개가 실패해야 정상이다.
실패 테스트를 고친 뒤에도 통과 중인 테스트가 가리고 있는 숨은 경계 버그를 직접 찾아 회귀 테스트를 추가해야 한다.

타입 검사만 실행하려면:

```bash
npm run typecheck
```

## 제출물

- 수정 diff: `git diff > scenario-01-timezone.patch` 또는 본인 GitHub에 올린 PR 링크
- 숨은 버그를 막는 회귀 테스트
- `PROMPT_LOG_TEMPLATE.md`를 채운 프롬프트 로그
- 1장 분량 회고록: AI가 틀린 지점, 검증 방법, 최종 diff를 선택한 이유

## 제출 방법

Gate 1에서는 수동 제출이다. 패치/PR 링크, 프롬프트 로그, 회고록을 `hello@thenocodes.org`로 보낸다.
로그인, 결제 연동, 제출 대시보드는 아직 없다.

## 학습자 안내

`SCENARIO.md` 를 먼저 읽어라 — 미션, 제출 방법, 채점 기준이 담겨 있다.
`PROMPT_LOG_TEMPLATE.md` 를 복사해 AI에게 준 맥락, AI가 틀린 지점, 직접 검증한 과정을 남겨라.

## 배포 방식

현재는 더노코즈 사이트에서 ZIP으로 배포한다.
GitHub 공개 리포는 별도 Gate 2 작업에서 실제 소유자와 경로가 확정된 뒤 열린다.
이 스타터 패키지에는 운영자용 `SOLUTIONS.md`가 포함되지 않는다.
