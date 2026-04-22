# 프롬프트 로그 (PROMPT LOG)

**도구 / Tool:** <!-- 예: Claude Code + claude-opus-4-7, Cursor + gpt-4o, ChatGPT + o3 -->
**날짜 / Date:** <!-- 예: 2026-04-22 -->
**시나리오 / Scenario:** Scenario #1 — 깨진 미팅 날짜 포매터 고치기

---

## 목표 (Goal)

<!-- 이 시도에서 무엇을 달성하려 했는지 한두 문장으로 적는다. -->
<!-- What were you trying to accomplish in this attempt? -->

---

## 보낸 프롬프트 (Prompts I sent)

<!-- 각 프롬프트를 보낸 순서대로 그대로 붙여넣는다. -->
<!-- Verbatim copy-paste of each prompt you sent, in order. -->

**Prompt 1:**
```
(여기에 붙여넣기)
```

**Prompt 2:**
```
(여기에 붙여넣기)
```

<!-- 필요한 만큼 추가 -->

---

## AI 응답 요약 (AI output — summary or verbatim)

<!-- AI가 뭐라고 했는지 — 요약이나 핵심 부분 그대로. -->
<!-- What did the AI say? Summary or key excerpt. -->

**Response 1:**
<!-- 요약 또는 핵심 코드 스니펫 -->

**Response 2:**
<!-- 요약 또는 핵심 코드 스니펫 -->

---

## 검증 시도 (Verification attempts)

<!-- AI 답변이 맞는지 어떻게 확인했는가? -->
<!-- What did you do to check if the AI's answer was correct? -->
<!-- Examples: ran tests, read the diff carefully, asked a second model, manual trace, brute-force test matrix, ... -->

- [ ] `npm test` 실행 — 몇 개 통과/실패?
- [ ] 코드 직접 읽기 — 변경 부분이 의도대로 동작하는가?
- [ ] 다른 모델에게 교차 검증 요청
- [ ] 경계 조건 수동 트레이스 (예: UTC 15:00, 15:15, 16:00)
- [ ] 추가 테스트 케이스 작성

---

## 최종 diff 근거 (Final diff rationale)

<!-- 최종 코드가 이렇게 된 이유를 명시적으로 적는다. -->
<!-- Why is the final code what it is? Contrast with alternatives AI proposed. -->

AI가 처음 제안한 수정:
```
(여기에 붙여넣기)
```

최종 채택한 수정과 그 이유:
```
(여기에 붙여넣기)
```

AI 제안과 다른 점, 그리고 그 이유:
<!-- AI가 놓친 부분이 있었는가? 어떻게 발견했는가? -->

---

<!-- 도구 이름과 모델명만 상단에 적어주세요 (예: Claude Code + claude-opus-4-7, Cursor + gpt-5). -->
