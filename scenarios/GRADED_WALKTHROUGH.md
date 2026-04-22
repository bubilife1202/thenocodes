---
title: 채점된 워크스루 (Graded Walkthrough)
scenario: "Scenario #1: flaky timezone test"
author: 더노코즈 운영자 (self-dogfood)
date: 2026-04-22
---

> **타당성 고지 (Validity disclaimer — F2):** 이 워크스루는 RUBRIC.md의 **운영성**(operability) — 동일 루브릭을 내부 모순 없이 적용할 수 있음 — 을 입증한다. **타당성**(validity) — 루브릭 점수가 실제 실력을 측정하는가 — 은 입증하지 않는다. 타당성은 Week-3 외부 채점자와의 inter-rater 데이터로만 확보된다.

---

## 1. 제출 요약

| 축 | 레벨 | 한 줄 요약 |
|---|---|---|
| **Collaboration** | **L3** | 2개 서브-태스크로 분해, 코드 부착, 수용 기준 명시. 3단계 사전 계획은 없었음. |
| **Verification** | **L3** | 브루트포스 매트릭스로 Bug B 발견. 수정 후 같은 모델에게 재검증 요청 — 독립 신호 아님. |
| **Improvement** | **L3** | 두 버그 모두 수정, 회귀 테스트 추가. 단 Bug B 관찰 이후 반응적으로 추가함. |

**총점:** L9 / L12

**핵심 성과:** 실패 테스트(Bug A)와 숨은 버그(Bug B) 모두 수정. Bug B 회귀 테스트 포함.

**아쉬운 지점:** 수정 후 검증을 같은 모델에게 맡겼다. 회귀 테스트를 Bug B 발견 이전에 예방적으로 추가하지 않았다.

---

## 2. 도그푸드 제출물 (Learner Voice)

**도구:** Claude Code + claude-opus-4-7
**날짜:** 2026-04-22

### 2.1 프롬프트 로그

#### 목표 (Goal)

`formatMeetupDate()` 테스트 3개 중 1개가 실패한다는 제보를 받았다. 실패 테스트를 통과시키고, 시나리오 설명대로 "통과하는 테스트 2개가 버그를 가리고 있다"는 힌트를 바탕으로 숨은 버그까지 찾아 고치는 것이 목표다. AI에게 모든 것을 한 번에 던지지 않고, (1) 실패 원인 파악 → (2) 숨은 버그 탐색 두 단계로 나눠서 진행하려 했다.

---

#### 1차 프롬프트

```
아래 유틸 함수와 테스트를 첨부한다.
테스트 3개 중 마지막 1개(late-night / midnight crossing)가 실패한다.

[formatMeetupDate.ts 전체 소스 첨부]
[formatMeetupDate.test.ts 전체 소스 첨부]

vitest 에러 메시지:
  Expected: "2026-04-29 (수) 01:30 KST"
  Received:  "2026-04-29 (화) 01:30 KST"

조건:
- 나머지 두 테스트(midday, evening)는 계속 통과해야 한다.
- 최소한의 수정만 한다.
- 코드를 바꾸기 전에, 실패 원인이 무엇인지 먼저 설명해라.
```

**AI 응답 요약:**

Claude는 `rawHour = utcDate.getUTCHours() + 9`로 `advancedDate`를 계산하면서 `weekday`는 여전히 `utcDate.getUTCDay()`에서 읽고 있다는 점을 정확히 짚었다. UTC 화요일 16:30은 Seoul에서는 수요일 01:30인데, 요일 레이블이 UTC 기준 화요일(`화`)로 나온다는 설명이었다.

제안한 수정:

```ts
// Before
const weekday = DAYS_KO[utcDate.getUTCDay()];

// After
const weekday = DAYS_KO[advancedDate.getUTCDay()];
```

원인 설명은 맞았다. 수정도 맞아 보였다.

**검증 시도:**

`npm test`를 돌렸다. 3/3 통과. 좋다 — 싶었는데, 잠깐 멈췄다. 시나리오 설명에서 "통과하는 테스트 2개는 버그를 가리고 있다"고 했다. 테스트가 다 통과한다고 버그가 없는 게 아니다.

**발견 — 삽질 1라운드:**

AI가 제안한 수정(`utcDate` → `advancedDate`)은 Bug A를 고쳤다. 그런데 소스를 다시 읽다가 `dayOverflow`를 계산하는 줄이 눈에 걸렸다:

```ts
const dayOverflow = rawHour > 24 ? 1 : 0;
```

`rawHour`가 정확히 24일 때 — UTC 15:00이면 9를 더해 24 — `> 24`는 false다. 날짜가 넘어가지 않는다. 이건 off-by-one처럼 보인다. AI가 이 줄에 대해서는 아무 말도 안 했다. 1차 프롬프트에서 "실패 원인 설명"만 요청했으니 AI가 이걸 언급할 이유가 없었다.

---

#### 2차 프롬프트

```
1차 수정(weekday를 advancedDate에서 읽도록) 반영 후 테스트는 3/3 통과했다.

그런데 "통과하는 테스트 2개가 버그를 가리고 있다"는 힌트가 신경 쓰인다.
아래 질문에 답하기 전에 코드를 수정하지 마라.

질문: UTC 시간 0~23 전체에 대해 rawHour 계산을 직접 추적해줘.
특히 rawHour가 정확히 24가 되는 케이스 — UTC 15:00 → Seoul 00:00 —
에서 dayOverflow가 올바르게 계산되는지 확인해라.

현재 코드의 해당 줄:
  const dayOverflow = rawHour > 24 ? 1 : 0;
```

**AI 응답:**

Claude는 UTC 15:xx를 직접 추적했다. `rawHour = 15 + 9 = 24`, `24 > 24` → false, `dayOverflow = 0`. 결과: `advancedDate`가 그대로 원본 날짜. `localHour = 24 % 24 = 0`. 날짜는 안 넘어갔는데 시간은 00:xx로 표시된다. 이것이 Bug B다 — Seoul 자정이 전날 날짜와 요일로 출력된다.

수정 제안:

```ts
// Before (Bug B)
const dayOverflow = rawHour > 24 ? 1 : 0;

// After
const dayOverflow = rawHour >= 24 ? 1 : 0;
```

**검증 시도 — 브루트포스 매트릭스:**

제안을 바로 적용하기 전에, UTC 0시부터 23시까지 수동으로 확인했다. `2026-03-21`(토요일)을 기준 날짜로 잡고 각 UTC 시간에 대해 서울 날짜/요일/시간이 어떻게 나오는지 직접 계산했다. 핵심 경계:

| UTC hour | rawHour | dayOverflow | Seoul date | Seoul hour | Seoul weekday (expected) |
|---|---|---|---|---|---|
| 14 | 23 | 0 | 2026-03-21 | 23 | 토 (6) |
| **15** | **24** | **0 (bug)** | **2026-03-21 (wrong)** | **00** | **토 (wrong — should be 일)** |
| 16 | 25 | 1 | 2026-03-22 | 01 | 일 (0) |

UTC 15:00일 때 날짜와 요일이 모두 틀린다. 수정 후 (`>= 24`):

| UTC hour | rawHour | dayOverflow | Seoul date | Seoul hour | Seoul weekday |
|---|---|---|---|---|---|
| **15** | **24** | **1 (fixed)** | **2026-03-22** | **00** | **일 (correct)** |

**발견 — Bug B 확정:**

`"2026-03-21T15:15:00Z"` → 수정 전: `"2026-03-21 (토) 00:15 KST"`, 수정 후 예상: `"2026-03-22 (일) 00:15 KST"`.

기존 테스트 중 UTC 15:xx를 입력하는 케이스가 없었기 때문에 3개 테스트가 모두 통과했어도 이 버그는 숨어 있었다.

---

#### 3차 프롬프트

```
Bug B를 확인했다. >= 24로 수정하면 UTC 15:xx → Seoul 00:xx 케이스가 올바르게
처리된다는 것을 브루트포스로 확인했다.

이제 두 수정을 합쳐달라:
1. weekday를 advancedDate에서 읽기 (Bug A 수정)
2. dayOverflow 조건을 >= 24로 변경 (Bug B 수정)

추가로: Bug B에 대한 회귀 테스트 1개를 test 파일에 추가해달라.
테스트 케이스: "2026-03-21T15:15:00Z" → "2026-03-22 (일) 00:15 KST"
테스트 의도를 주석으로 설명해달라.
기존 테스트 3개는 건드리지 마라.
```

**AI 응답:**

두 수정을 반영한 전체 함수 + 회귀 테스트 1개를 내놓았다. 구조는 내가 지정한 대로였다. 수정된 줄 두 곳이 내가 직접 확인한 내용과 일치했다.

**검증 시도:**

`npm test`를 돌려 4/4 통과를 확인했다. 그 다음 Claude에게 "이 수정이 UTC 14:xx, 15:xx, 16:xx 케이스 모두에서 올바른가?" 재확인 요청했다. Claude가 맞다고 답했다.

— 여기서 문제: 같은 모델에게 자기 작업을 다시 검토시킨 것이다. 이건 독립 신호가 아니다. 다른 모델로 cross-check하거나, 내가 직접 30일치 날짜를 열거해 확인하는 것이 독립 신호였을 것이다.

**최종 diff 근거:**

1차 프롬프트에서 AI가 Bug A만 제안했을 때 즉시 적용하지 않았다. 소스를 읽으면서 `> 24` 줄을 발견했고, 2차 프롬프트로 Bug B를 분리해 추적했다. 최종 diff는 1차 AI 응답의 재포장이 아니라 두 번의 검증 사이클을 거친 합성이다.

---

### 2.2 최종 PR diff

```diff
--- a/scenarios/scenario-01-timezone/src/formatMeetupDate.ts
+++ b/scenarios/scenario-01-timezone/src/formatMeetupDate.ts
@@ -23,7 +23,7 @@ export function formatMeetupDate(utc: string, tz: string): string {
-  const dayOverflow = rawHour > 24 ? 1 : 0;
+  const dayOverflow = rawHour >= 24 ? 1 : 0;
 
   const advancedDate = new Date(utcDate);
   advancedDate.setUTCDate(utcDate.getUTCDate() + dayOverflow);
@@ -36,7 +36,7 @@ export function formatMeetupDate(utc: string, tz: string): string {
-  const weekday = DAYS_KO[utcDate.getUTCDay()];
+  const weekday = DAYS_KO[advancedDate.getUTCDay()];
```

```diff
--- a/scenarios/scenario-01-timezone/src/formatMeetupDate.test.ts
+++ b/scenarios/scenario-01-timezone/src/formatMeetupDate.test.ts
@@ -26,4 +26,13 @@ describe('formatMeetupDate', () => {
     expect(formatMeetupDate('2026-04-28T16:30:00Z', 'Asia/Seoul')).toBe(
       '2026-04-29 (수) 01:30 KST',
     );
   });
+
+  it('formats Seoul midnight exactly (rawHour === 24, Bug B regression)', () => {
+    // UTC 2026-03-21 15:15 (Saturday) → Seoul 2026-03-22 00:15 (Sunday)
+    // rawHour = 15 + 9 = 24. Bug B: `> 24` fails to advance the date.
+    // Fix: `>= 24` correctly advances to the next calendar day.
+    expect(formatMeetupDate('2026-03-21T15:15:00Z', 'Asia/Seoul')).toBe(
+      '2026-03-22 (일) 00:15 KST',
+    );
+  });
 });
```

---

### 2.3 회고 (Reflection)

**맨 처음 삽질:**

1차 프롬프트 결과로 Bug A를 고쳤고 테스트가 3/3 통과했다. 처음에는 "다 됐다"는 느낌이 들었다. 시나리오 설명의 "통과하는 테스트 2개가 버그를 가리고 있다"라는 힌트가 없었다면 여기서 제출했을 것이다. 실제로 1차 AI 응답은 `weekday` 줄만 언급했고 `dayOverflow` 줄은 건드리지 않았다. 내가 소스를 직접 읽지 않았다면 `> 24`를 눈치채지 못했을 것이다.

**가장 크게 배운 점:**

테스트가 다 통과해도 코드를 직접 읽어야 한다. `> 24`처럼 off-by-one은 기존 테스트 입력값이 그 경계를 밟지 않으면 영원히 통과한다. 이번에는 우연히 소스를 읽다가 발견했는데, 더 체계적인 방법은 "경계에서 무슨 일이 일어나는가"를 명시적으로 물어보는 것이다 — `rawHour`가 23, 24, 25일 때 각각 어떻게 되는지.

**AI가 놓친 부분:**

1차 프롬프트에서 AI는 실패 테스트의 원인(`weekday` 소스)만 봤고, 옆에 있는 `dayOverflow` 조건은 범위 밖이라 언급하지 않았다. 이건 AI 잘못이 아니다 — 내가 "실패 원인만 설명해달라"고 지시했다. 숨은 버그를 찾으려면 내가 별도로 요청해야 했다. 2차 프롬프트에서 `rawHour === 24` 케이스를 명시적으로 추적해달라고 하자 곧바로 정확히 짚었다.

**검증에서 아쉬운 점:**

Bug B 수정 후 Claude에게 "이 수정이 경계 케이스 전체에서 올바른가?"라고 물어 확인을 받았다. 체감상 안심이 됐지만 사실 독립 신호가 아니다. 같은 모델이 자기 작업을 재검토하면 같은 맹점을 공유할 수 있다. 다음에는 수동으로 UTC 0~23 각각의 서울 날짜·시간·요일을 직접 열거해 확인하거나, 다른 모델로 cross-check해야 한다.

**회귀 테스트 타이밍:**

Bug B 회귀 테스트는 3차 프롬프트에서, 즉 Bug B를 발견한 다음에 추가했다. 2차 프롬프트 전에 "경계 케이스 테스트를 먼저 작성하고 실패 확인 후 수정"하는 TDD 흐름을 따랐다면 더 좋았다. 버그를 관찰한 다음 테스트를 추가하는 건 옳지만, 관찰 전에 추가하는 것이 더 강한 방어다.

**다음번에는:**

1. 수정 전에 "이 함수가 다루는 경계 케이스 목록을 열거해달라"를 먼저 요청한다.
2. 경계 케이스 테스트를 먼저 작성해 실패를 확인한 뒤 수정한다.
3. 수정 검증은 같은 모델이 아닌 독립 수단(다른 모델, 직접 열거, adversarial 입력)으로 한다.

---

## 3. 채점 (Graded Section)

### 3.1 Collaboration = L3

**증거 인용:**

> "조건: 나머지 두 테스트(midday, evening)는 계속 통과해야 한다. 최소한의 수정만 한다. 코드를 바꾸기 전에, 실패 원인이 무엇인지 먼저 설명해라."
> (1차 프롬프트)

> "아래 질문에 답하기 전에 코드를 수정하지 마라."
> (2차 프롬프트)

이 학습자는 god-prompt를 피했다. (1) 태스크를 "원인 파악"과 "숨은 버그 탐색" 두 단계로 분리했고, (2) 각 프롬프트에 관련 소스 코드를 직접 첨부했으며, (3) 수용 기준("나머지 테스트 통과", "최소 수정", "코드 전에 설명 먼저")을 명시했다. RUBRIC.md Collaboration-L3 앵커 — "Break the task into ≥2 sub-prompts with explicit acceptance criteria per sub-step; each prompt includes the relevant code snippet" — 에 직접 매핑된다.

**L2로 내려갔을 조건 (L-1 contrast):**

학습자가 `"타임존 테스트가 실패해요. 뭔가 잘못됐나요? 고쳐주세요."` 한 줄로 시작하고 테스트 파일 내용이나 실패 메시지를 붙이지 않았다면 L2였다. 수용 기준이 없으면 AI는 어떤 테스트가 통과해야 하는지 알 수 없고, "최소 수정"이 무엇인지도 추론으로 채울 수밖에 없다. 컨텍스트 없는 프롬프트 + 에러 메시지 붙여넣기 수준이 L2의 전형이다.

**L4로 올라갔을 조건 (L+1 contrast):**

첫 번째 프롬프트를 보내기 전에 프롬프트 로그에 3단계 계획 — "1) 실패 원인 파악 → 2) 경계 케이스 브루트포스 → 3) 회귀 테스트 추가" — 을 먼저 선언했다면 L4였다. 또는 1차 AI 응답(`weekday` 수정)을 받은 뒤 "이 답변은 Bug A만 다룬다 — 지금 2단계인 숨은 버그 탐색으로 넘어가자"는 **명시적 리다이렉션**을 포함했어야 한다. 이 학습자는 2차 프롬프트로 자연스럽게 전환했지만, 사전 계획 선언과 명시적 단계 전환 문장은 없었다.

---

### 3.2 Verification = L3

**증거 인용:**

> "2026-03-21(토요일)을 기준 날짜로 잡고 각 UTC 시간에 대해 서울 날짜/요일/시간이 어떻게 나오는지 직접 계산했다."
> (2차 프롬프트 검증 시도 — 브루트포스 매트릭스)

> "같은 모델에게 자기 작업을 다시 검토시킨 것이다. 이건 독립 신호가 아니다."
> (3차 프롬프트 검증 시도 — 학습자 스스로 한계를 인식하고 기록함)

이 학습자는 테스트 통과로 만족하지 않고 소스 코드를 직접 읽어 `> 24` 조건을 발견했다. 2차 프롬프트에서는 UTC 0~23 전체 범위를 수동으로 추적해 경계 케이스를 체계적으로 검증했다. 기존 테스트가 커버하지 않는 경계(UTC 15:xx → Seoul 00:xx)를 직접 탐색해 Bug B를 발견한 것은 RUBRIC.md Verification-L3 앵커 — "Probe at least one boundary condition that the existing tests do not cover; document what was tested and what the result was" — 에 직접 매핑된다.

**L2로 내려갔을 조건 (L-1 contrast):**

1차 AI 응답(`weekday` 수정) 적용 후 `npm test`를 돌려 3/3 통과를 확인하고 제출했다면 L2였다. "숨은 버그를 가리고 있다"는 힌트를 무시하거나, 테스트 색깔이 모두 초록이면 검증 완료로 해석하는 패턴이다. Bug B는 기존 테스트 입력값이 UTC 15:xx를 다루지 않기 때문에 단순 `npm test`로는 영원히 통과한다.

**L4로 올라갔을 조건 (L+1 contrast):**

Bug B 수정 후 검증을 Claude에게 다시 맡기는 대신, (a) 다른 모델(GPT-5, Gemini 등)로 cross-check하거나, (b) UTC 0~23 × 여러 기준 날짜(평일/주말, 월말/월초, 윤년 2월 28일 등)를 직접 열거해 수동 확인했다면 L4였다. 독립 신호 — 같은 맹점을 공유하지 않는 검증 수단 — 의 유무가 L3와 L4를 가른다.

---

### 3.3 Improvement = L3

**증거 인용:**

> "최종 diff는 1차 AI 응답의 재포장이 아니라 두 번의 검증 사이클을 거친 합성이다."
> (최종 diff 근거)

> "Bug B 회귀 테스트는 3차 프롬프트에서, 즉 Bug B를 발견한 다음에 추가했다."
> (회고)

이 학습자는 단일 AI 응답을 그대로 채택하지 않았다. 1차 응답(Bug A) → 소스 직접 독해 → 2차 프롬프트(Bug B 추적) → 3차 프롬프트(통합 수정 + 회귀 테스트)라는 3라운드 반복을 거쳤다. 각 라운드의 프롬프트는 이전 검증 결과를 명시적으로 반영한다. 최종 diff는 두 버그 모두 수정 + 회귀 테스트 포함이다. RUBRIC.md Improvement-L3 앵커 — "Show ≥2 distinct revision rounds where each new prompt demonstrably incorporates a finding from the previous verification step" — 에 매핑된다. 또한 반영 로그에서 "AI가 놓친 `> 24` 조건을 내가 직접 발견해 2차 프롬프트로 명시했다"고 AI 출력을 수정한 이유를 설명하고 있다.

**L2로 내려갔을 조건 (L-1 contrast):**

최종 diff가 Bug A(`weekday` 수정)만 포함하고 Bug B(`> 24`)는 `// TODO: off-by-one 확인 필요` 주석으로 남겼거나 아예 언급하지 않았다면 L2였다. 실패 테스트 1개를 통과시키는 것에 만족하고 숨은 버그를 후속 QA에 떠넘기는 패턴. 이 경우 반복은 있었지만 합성이 불완전하다.

**L4로 올라갔을 조건 (L+1 contrast):**

Bug B 회귀 테스트를 **발견 이전에** — 즉 2차 프롬프트 이전에 "혹시 존재할 수 있는 경계 케이스를 위해 UTC 15:xx → Seoul 00:xx 케이스의 테스트를 먼저 작성하고 실패를 확인한 뒤 수정"하는 TDD 흐름으로 진행했다면 L4였다. 이 학습자는 Bug B를 관찰한 이후에 회귀 테스트를 추가했다 — 올바르지만 반응적이다. 예방적 회귀 테스트는 "다음에 비슷한 off-by-one이 나타났을 때 테스트가 먼저 잡는다"는 설계 의도까지 담는다.

---

## 4. 채점자 메모 (Grader Notes)

**루브릭 운영성 확인:**

3개 축 × L2/L3/L4 contrast 범위 = 9개 셀을 이 제출물에 적용했다. 각 축의 앵커가 서로 배타적으로 작동했으며 내부 모순 없이 적용됐다. L3 근거 인용은 모두 섹션 2의 프롬프트 로그와 회고 내용에서 추적 가능하다.

**내부 일관성 체크:**

- 3.1 Collaboration 증거 인용 → 2.1 프롬프트 로그 1차·2차 프롬프트에 해당 문장 존재. ✓
- 3.2 Verification 증거 인용 → 2.1 프롬프트 로그 "브루트포스 매트릭스" 항목 + "독립 신호 아님" 자기 관찰. ✓
- 3.3 Improvement 증거 인용 → 2.1 프롬프트 로그 "최종 diff 근거" + 2.3 회고 "타이밍" 항목. ✓

**후속 (Week-3 inter-rater 체크):**

동일 제출물(섹션 2 전체 — 프롬프트 로그 + diff + 회고)을 외부 채점자 1명에게 RUBRIC.md만 전달하고 독립 채점을 받는다. 3개 축 중 2개 이상에서 레벨 차이가 ≤1이면 운영성 확인 완료. 1개 축이라도 >1 차이가 나오면 해당 축의 앵커를 보강하고 재시도한다. 결과는 `.omc/plans/` 하위에 기록한다.
