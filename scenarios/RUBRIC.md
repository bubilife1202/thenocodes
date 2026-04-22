# 더노코즈 AI-Assisted Scenario 채점 루브릭 (v2)

> ⚠ 외부 채점자 운영성 확인 (TN-V2-P2) — 사람이 직접 수행. Ralph가 자동화하지 않는다.
> GRADED_WALKTHROUGH.md 공개 전 ≥1명 외부 채점자가 이 문서만 보고 도그푸드 제출물을
> 독립 채점. 축별 >1레벨 차이 → 앵커 보강 후 재시도.

**버전:** v2.0 · **최종 갱신:** 2026-04-22

---

## 루브릭 개요

채점 대상은 **과정(process)**이며, 결과물(diff) 자체의 완성도가 아니다. 테스트 통과 여부는
시나리오 합격/불합격 기준이고, 루브릭은 그 결과에 이르는 방식을 평가한다.

- **3개 축:** Collaboration · Verification · Improvement
- **레벨 범위:** 각 축 L1–L4. 제출물 1개의 총합 범위 = L3(최저) ~ L12(최고)
- **총점보다 축별 레벨이 의미 있는 신호다.** "L12"보다 "V-L4, C-L2" 쪽이 피드백으로
  유용하다.
- **왜 LLM이 채점하지 않는가:** AI-assisted 결과물을 AI가 채점하면 재귀 함정이 생긴다.
  루브릭 v2는 계획 원칙 P4에 따라 사람이 전적으로 채점한다. v3에서 AI 보조가 도입되더라도
  사람의 최종 판단이 항상 우선한다.

---

## 축 1: Collaboration (협업)

**정의:** 학습자가 AI를 어떻게 지휘했는가. 태스크를 단계별로 분해했는지, 문맥을
충분히 첨부했는지, 목표와 제약을 명시했는지를 측정한다. "학습자가 상호작용을 이끌었는가,
아니면 AI에게 수동적으로 끌려갔는가?"

### L1 (미충족)

- Submit a single "god-prompt" that dumps the entire problem at once with no task breakdown,
  no constraints, and no acceptance criteria; the prompt log shows one exchange producing the
  final diff.
- Prompt log is absent or contains only AI output with no evidence of the learner's own
  framing, making it impossible to assess how the task was directed.

### L2 (부분 충족)

- Break the problem into ≥2 exchanges but without explicit acceptance criteria per step;
  prompts are paraphrases of the error message rather than a decomposed sub-task with
  context attached (e.g., relevant code snippet, failing test output, constraints).
- Attach some context to at least one prompt but omit key constraints (such as which tests
  must not break), forcing AI to guess assumptions that the learner could have specified.

### L3 (충족)

- Break the task into ≥2 sub-prompts with explicit acceptance criteria per sub-step; each
  prompt includes the relevant code snippet or test output rather than relying on AI to
  retrieve it.
- Demonstrate awareness of scope boundaries in prompts — at least one prompt explicitly
  names what the fix should NOT touch, or asks the AI to explain its reasoning before
  producing code.

### L4 (탁월)

- Decompose the problem into a sequenced plan (stated in the prompt log or reflection) before
  issuing any code-producing prompt; each prompt builds on the verified output of the previous
  step rather than re-stating the full problem.
- Prompt log shows the learner correcting AI misunderstanding mid-session by providing a
  counter-example or a concrete failing case, redirecting the conversation without simply
  asking AI to "try again."

---

## 축 2: Verification (검증)

**정의:** 학습자가 AI 출력을 수락하기 전에 어떻게 검증했는가. 테스트 실행, diff 직접
검토, 엣지케이스 탐색, 독립 신호 사용(다른 모델, 수동 추적, 역방향 테스트)을 측정한다.
"학습자가 제출 전에 AI 오류를 잡았는가?"

### L1 (미충족)

- Accept AI's first output without running tests or reading the diff; the submitted artifact
  is the AI response copy-pasted with no evidence of verification having occurred.
- Reflection log acknowledges a visible test failure was fixed but shows no awareness of
  whether passing tests were affected or whether other failure modes exist.

### L2 (부분 충족)

- Run the existing test suite after AI's suggestion and report pass/fail, but take no further
  verification step — no diff review, no probe for edge cases, no adversarial test.
- Note that one specific input case was checked manually but do not document the verification
  reasoning, making it unclear whether the check was thorough or accidental.

### L3 (충족)

- Run the full test suite AND read the diff line-by-line; reflection log identifies at least
  one specific risk in the AI-proposed change (e.g., "this change assumes UTC input but the
  function is called with local time in two places — I confirmed both call sites").
- Probe at least one boundary condition that the existing tests do not cover; document what
  was tested and what the result was, even if no bug was found.

### L4 (탁월)

- Identify ≥1 AI error before submission, document the failure mode (hallucinated API,
  off-by-one, wrong assumption about data shape), and validate the fix against an independent
  signal — a second model's review, a manual trace, or an adversarial test not in the
  original suite. (예: Bug B와 같은 숨은 버그를 기존 통과 테스트만으로는 발견할 수 없음을
  인식하고, 경계값이나 자정·DST 전환 케이스를 직접 생성해 검증한 경우.)
- Construct a boundary-probing test or input matrix that systematically covers cases the
  seeded test suite omits; the test matrix or probe is present in the submitted diff or
  documented in the reflection log with explicit rationale for which cases were chosen.

---

## 축 3: Improvement (개선)

**정의:** 학습자가 AI 출력이 잘못되거나 불완전할 때 어떻게 반복 개선했는가. 여러 라운드의
수렴, 검증 결과를 다음 프롬프트에 통합, 최종 결과물이 단순한 AI 첫 초안 이상인지를 측정한다.
"최종 결과물이 이유 있는 반복의 산물인가, AI 첫 답변의 재포장인가?"

### L1 (미충족)

- Submit AI's first or second attempt without modification; the final diff fixes only the
  visibly failing test and leaves any deeper or hidden bug untouched, with no evidence of
  deliberate iteration. (예: Bug B가 수정되지 않은 채 Bug A만 고쳐진 diff.)
- Reflection log describes what AI produced but does not describe what the learner changed,
  why, or what they learned — iteration, if it happened, is invisible in the artifacts.

### L2 (부분 충족)

- Iterate ≥1 round on AI output but do not converge — final submission is AI's second
  attempt rather than a reasoned synthesis; the learner re-prompted without integrating
  verification findings into the new prompt.
- Show ≥1 round of revision in the prompt log but the final diff regresses a passing test
  or leaves a known issue the learner mentioned in the reflection; synthesis is incomplete.

### L3 (충족)

- Show ≥2 distinct revision rounds where each new prompt demonstrably incorporates a finding
  from the previous verification step (e.g., "the previous fix broke the DST boundary — I
  told AI the specific failing input and asked it to re-approach"); final diff is traceable
  to that iterative reasoning.
- Reflection log explicitly names ≥1 place where the learner overrode or modified AI output
  based on their own understanding, explaining why the AI's version was insufficient.

### L4 (탁월)

- Final diff fixes all identified bugs AND adds regression tests for the hidden bug, with
  the tests' intent documented in a comment or the reflection log — demonstrating that the
  learner understood the failure mode, not just patched the symptom. (예: Bug A 수정 +
  Bug B 수정 + Bug B에 대한 회귀 테스트 추가, 테스트 의도 설명 포함.)
- Reflection shows synthesis beyond any single AI suggestion: learner explains a design
  choice that deviates from AI's recommendation, with a rationale grounded in the
  codebase context (constraints, call-site behavior, future maintainability), not just
  personal preference.

---

## 채점 프로토콜 (Grading Protocol)

### 읽는 순서

1. **Reflection log 전체 읽기.** 학습자 자신의 언어로 무슨 일이 있었는지 파악한다.
   루브릭 가설을 세우되 확정하지 않는다.
2. **Prompt log 읽기.** Collaboration 레벨을 판정한다. 분해 여부, 맥락 첨부, 수락 기준
   명시 여부를 확인한다.
3. **Final diff 읽기.** Verification·Improvement 레벨을 판정한다. 무엇이 수정됐는지,
   테스트가 추가됐는지, 숨은 버그가 처리됐는지 확인한다.
4. **축별 레벨 확정.** 각 축을 독립적으로 판정한다. 한 축의 탁월함이 다른 축의 결핍을
   보상하지 않는다.
5. **증거 인용 선택.** 각 축 판정에 대해 prompt log 또는 diff에서 ≥1 문장/라인을 인용한다.
   피드백 문서에 인용 없는 점수는 유효하지 않다.

### 가중치

- Collaboration 1/3 · Verification 1/3 · Improvement 1/3 (등가)
- 축별 레벨은 독립적으로 매긴다. 축 간 보상 없음.

### 총점 해석

| 총점 | 의미 |
|---|---|
| **L12 (4+4+4)** | 실무 이전 가능한 수준. 학습자는 AI와 함께 일하는 방식을 내면화했다. 상위 코호트 피드백 대상. |
| **L9–11** | 하나 이상의 축에서 강점이 명확하고 전체적으로 유능하다. 약점 축 1개에 집중 피드백. |
| **L6–8** | 전반적으로 시도는 있으나 실행이 약하거나 불균등하다. 가장 낮은 축부터 개선 권고. |
| **L3–5** | AI 출력을 수동적으로 수락하거나 반복 없이 제출했다. 시나리오 재시도 또는 1:1 피드백 권고. |

### Tie-break

같은 축에서 L2와 L3 경계에 있을 때: **다음 기준으로 올림(L3).**
- 해당 수준의 행동이 1회가 아니라 **일관되게** 나타난다.
- 증거가 prompt log와 diff 양쪽에 존재한다 (한쪽에만 있으면 L2 유지).

L3와 L4 경계에서 올림(L4): 행동이 **이 시나리오 맥락을 넘어 다른 상황에도 전이될 것이라는
증거**가 있을 때만 올림. 단발적 탁월한 행동 하나만으로는 L4가 아니다.

### 무엇을 채점하지 않는가

- 최종 diff의 미적 완성도 (코딩 스타일, 네이밍, 포매팅)
- 제출 속도 또는 소요 시간
- AI 도구 선택 (Claude / Cursor / ChatGPT / Gemini 모두 동등하게 취급)
- 영어/한국어 사용 비율
- Prompt log의 길이 자체 (길다고 좋은 것이 아니다)

---

## 외부 채점자 운영성 확인 프로토콜 (인간 전용)

이 프로토콜은 GRADED_WALKTHROUGH.md 공개 이전에 반드시 완료해야 한다.

1. **외부 채점자 초대:** 더노코즈 Discord에서 프로덕트 개발에 관여하지 않은 채점자
   ≥1명을 Slack DM으로 초대한다. 이 문서(RUBRIC.md)만 전달하고 도그푸드 제출물을 건네준다.
   GRADED_WALKTHROUGH.md나 운영자의 채점 결과는 전달하지 않는다.
2. **독립 채점:** 채점자는 이 문서만 보고 축별 레벨과 증거 인용을 작성한다.
   운영자와 사전 논의 없이 진행한다.
3. **디스어그리 확인:** 운영자와 외부 채점자의 축별 점수를 비교한다.
   **축별 >1레벨 차이가 있는 경우 해당 축의 앵커를 보강하고 채점자에게 재검토를 요청한다.**
   보강 후 차이가 ≤1레벨이 될 때까지 반복한다.
4. **완료 기록:** 최종 합의된 점수와 앵커 수정 내역을 `.omc/plans/` 하위에 기록한다.
   이 기록이 없으면 GRADED_WALKTHROUGH.md를 공개하지 않는다.
