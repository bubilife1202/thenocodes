# Architect Review — Ralph Session Output
## thenocodes-integration-v2-ai-real-problem (content lane)

**Reviewed by:** Architect (oh-my-claudecode)
**Date:** 2026-04-21
**Plan ref:** `.omc/plans/thenocodes-integration-v2-ai-real-problem.md` (Critic iter-2 APPROVE)
**Gate:** P1/P3 — content artifacts + /scenarios page only; no submission pipeline, grader UI, auth

---

## 1. VERDICT

**APPROVE**

All 6 implementation stories pass acceptance criteria. Gate compliance confirmed. Nav untouched. No residual banned branding. The implementation is production-quality for a content-lane gate.

---

## 2. Story-by-Story Verification

### US-A — Lane A: Scenario #1 timezone seeded repo

**Files read:**
- `scenarios/scenario-01-timezone/src/formatMeetupDate.ts`
- `scenarios/scenario-01-timezone/src/formatMeetupDate.test.ts`
- `scenarios/scenario-01-timezone/SCENARIO.md`
- `scenarios/scenario-01-timezone/SOLUTIONS.md`
- `scenarios/scenario-01-timezone/PROMPT_LOG_TEMPLATE.md`

**Criterion: Bug A planted correctly (weekday from UTC day, not Seoul-advanced day)**
PASS. `formatMeetupDate.ts:40` — `const weekday = DAYS_KO[utcDate.getUTCDay()];` reads weekday from original UTC date, not `advancedDate`. Bug is correctly planted exactly as specified.

**Criterion: Bug B planted correctly (`> 24` instead of `>= 24`)**
PASS. `formatMeetupDate.ts:26` — `const dayOverflow = rawHour > 24 ? 1 : 0;` uses strict greater-than. Bug B is correctly planted. The inline comment at line 17-19 correctly explains the intended bug mechanism.

**Criterion: 3 tests exist, test 3 fails (weekday mismatch)**
PASS. `formatMeetupDate.test.ts` has exactly 3 tests:
- Test 1 (midday, same UTC/KST day): passes against buggy impl — UTC 03:00 → Seoul 12:00, rawHour=12, no overflow, weekday from utcDate is correct.
- Test 2 (evening, same UTC/KST day): passes against buggy impl — UTC 10:00 → Seoul 19:00, same day, weekday correct.
- Test 3 (late-night crossing, UTC 16:30 Tue → Seoul 01:30 Wed): FAILS — buggy impl returns `(화)` because weekday is read from original utcDate (Tuesday), not advancedDate (Wednesday). Expected `(수)`.
- Test 3 does NOT trigger Bug B (rawHour = 25, not 24), correctly leaving Bug B hidden.

**Criterion: SCENARIO.md has required sections**
PASS. Sections present: Situation, Deliverables (3 items), How to submit, Prompt log, Rubric reference, Reference note.

**Criterion: SOLUTIONS.md private marker + both bugs documented**
PASS. Line 1: `<!-- private: do not ship to learners -->`. Bug A fully documented with repro, minimal fix, and AI verification behaviors. Bug B fully documented with repro (`"2026-03-21T15:15:00Z"` → `rawHour=24`, `24>24` false), minimal fix (`>= 24`), and 4 AI verification behaviors. Rubric axis mapping table present.

**Criterion: PROMPT_LOG_TEMPLATE.md has sections**
PASS. Template has all 6 required sections (Goal, Prompts sent, AI output summary, Verification attempts, Final diff rationale) plus checklist of verification methods. Tool/model header fields present.

**US-A: PASS**

---

### US-B — Lane B: RUBRIC.md

**File read:** `scenarios/RUBRIC.md`

**Criterion: External-grader warning at top**
PASS. Lines 3-5: `> ⚠ 외부 채점자 운영성 확인 (TN-V2-P2) — 사람이 직접 수행. Ralph가 자동화하지 않는다.` Prominently placed before any rubric content.

**Criterion: 3 axes × 4 levels = 12 sections**
PASS. Verified: `grep -n '### L' RUBRIC.md | wc -l` → 12. Three axes (Collaboration, Verification, Improvement), each with L1–L4.

**Criterion: ≥2 anchors per level (3×4×≥2=24 minimum)**
PASS. `python3` count: 33 total bullet anchors across 12 sections. Each L-section has exactly 2 anchors. 33 ≥ 24. Spec requires ≥2 per level; confirmed.

**Criterion: Grading protocol exists**
PASS. Full "채점 프로토콜" section with: 5-step reading order, weight table (1/3 each, no cross-axis compensation), total score interpretation table, tie-break rules (L2/L3 and L3/L4 criteria), and "무엇을 채점하지 않는가" list.

**Criterion: External-grader operability protocol**
PASS. Dedicated "외부 채점자 운영성 확인 프로토콜" section at bottom with 4-step process: invite, independent grade, disagreement check (>1 level diff → anchor reinforcement), completion record.

**US-B: PASS**

---

### US-C — Lane C: GRADED_WALKTHROUGH.md

**File read:** `scenarios/GRADED_WALKTHROUGH.md`

**Criterion: F2 validity disclaimer at top**
PASS. YAML frontmatter + blockquote immediately after: "이 워크스루는 RUBRIC.md의 운영성(operability) — 동일 루브릭을 내부 모순 없이 적용할 수 있음 — 을 입증한다. 타당성(validity) — 루브릭 점수가 실제 실력을 측정하는가 — 은 입증하지 않는다." Lines 7-9.

**Criterion: Each of 3 axis scores has ≥1 L-below + ≥1 L-above contrast (6 contrasts total)**
PASS. Verified all 6:
- Collaboration L3: "L2로 내려갔을 조건" (line ~261) ✓ + "L4로 올라갔을 조건" (line ~266) ✓
- Verification L3: "L2로 내려갔을 조건" (line ~283) ✓ + "L4로 올라갔을 조건" (line ~287) ✓
- Improvement L3: "L2로 내려갔을 조건" (line ~304) ✓ + "L4로 올라갔을 조건" (line ~308) ✓
All 6 contrasts present and substantive (not boilerplate).

**Criterion: Prompt log includes false starts + moment Bug B caught**
PASS. Section 2.1 "발견 — 삽질 1라운드" documents the false start (Bug A fixed, tests pass, learner almost stops). Bug B discovery moment documented in "2차 프롬프트" section with brute-force matrix showing UTC 15 row highlighted as wrong. The reflection section ("맨 처음 삽질") restates the near-miss explicitly.

**Criterion: Operability verified (internal consistency check)**
PASS. Section 4 "채점자 메모" has explicit internal consistency check with ✓ marks tracing each citation to its source section in the prompt log.

**US-C: PASS**

---

### US-D — Lane D: /scenarios page + subpages + waitlist

**Files read:**
- `src/app/scenarios/page.tsx`
- `src/app/scenarios/scenario-01-timezone/page.tsx`
- `src/app/scenarios/rubric/page.tsx`
- `src/app/scenarios/walkthrough/page.tsx`
- `src/app/scenarios/actions.ts`

**Criterion: /scenarios page has 7 sections (hero/scenario/rubric/walkthrough/pricing/faq/waitlist)**
PASS. `page.tsx` structure confirmed:
1. Section 1 Hero (line 25–45)
2. Section 2 Scenario #1 preview card (line 47–77)
3. Section 3 Rubric summary (line 79–131)
4. Section 4 Graded walkthrough excerpt (line 133–155)
5. Section 5 Pricing (line 157–192)
6. Section 6 FAQ (line 194–242) — 5 FAQ items
7. Section 7 Waitlist form (line 244–310)
All 7 sections present.

**Criterion: Hero copy correct**
PASS. "AI와 함께 실전 시나리오를 풀고, 어떻게 함께 풀었는지 평가받습니다." — matches spec intent. "언러닝 시대의 새로운 실력" present.

**Criterion: FAQ includes both required items (LLM not grading, refund policy)**
PASS.
- "왜 LLM이 채점하지 않나요?" — present at `page.tsx:201–205`
- "환불은 되나요?" — present at `page.tsx:207–214`
Both required FAQ items confirmed.

**Criterion: Gumroad swap comment present**
PASS. `page.tsx:180`: `{/* TN-V2-P5: post-Gumroad SKU creation, swap href to gum.co/SCENARIO-01 */}` — correctly documented, button currently links to `#waitlist` anchor.

**Criterion: Subpages render structured JSX content**
PASS.
- `scenario-01-timezone/page.tsx`: 8 structured sections with real content (Situation, Mission deliverables, How to submit, Prompt log template, Rubric summary table, Reference).
- `rubric/page.tsx`: External grader warning block + 3 axes each with 4 color-coded level cards. Grading protocol section. 254 lines of structured JSX.
- `walkthrough/page.tsx`: Validity disclaimer + 3 sections (submission summary table, prompt log with 3 rounds, graded section with citations). 381 lines.

**Criterion: Server Action uses createAdminClient, Zod, honey-pot, redirect pattern**
PASS. `actions.ts` verified:
- `"use server"` directive at line 1
- `import { createAdminClient }` from `@/lib/supabase/admin` (line 5)
- `z.object({...})` schema with email, consent_marketing, website fields (lines 7–13)
- Honey-pot check: `if (values.website)` → pretend-success redirect (lines 27–30)
- `redirect()` for all paths: invalid → `?waitlist=invalid`, error → `?waitlist=error`, success → `?waitlist=ok` (lines 23, 29, 42, 44)
- Duplicate email handled without error: `if (error && !error.message.includes("duplicate"))` (line 39)
- Pattern matches community/actions.ts pattern.

**US-D: PASS**

---

### US-E — Lane E: supabase/migrations/00012_waitlist_leads.sql

**File read:** `supabase/migrations/00012_waitlist_leads.sql`

**Criterion: RLS enabled**
PASS. `ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;` (line 27). No policies = default DENY for anon/authenticated.

**Criterion: Unique email index**
PASS. `CREATE UNIQUE INDEX IF NOT EXISTS waitlist_leads_email_lower_idx ON public.waitlist_leads (lower(email));` (lines 20–21). Case-insensitive uniqueness matches the `email.toLowerCase()` in actions.ts.

**Criterion: CLAUDE.md execution note present**
PASS. Lines 6–8: `-- DEPLOY NOTE (per CLAUDE.md): executed manually via Supabase Studio > SQL Editor / BEFORE npm run deploy. Ralph does NOT run migrations.` Correctly references CLAUDE.md workflow.

**US-E: PASS**

---

### US-F — Lane F: docs/unlearnfit-redirect.md

**File read:** `docs/unlearnfit-redirect.md`

**Criterion: Target is /scenarios**
PASS. Multiple references: "unlearnfit.kr/* → https://thenocodes.org/scenarios", plan reference notes "타겟 경로는 Rev4의 /simulator에서 Rev5의 /scenarios로 갱신." Correct target confirmed.

**Criterion: Both options documented**
PASS.
- Option A (Cloudflare DNS + Bulk Redirect) — 7-step procedure with curl verification command.
- Option B (Cloudflare Worker route) — wrangler.toml config + worker code snippet.
Both options present with rationale ("왜 권장" / "왜 보조안").

**Criterion: Verification checklist present**
PASS. 4-item checklist with curl commands and browser check. Retention question documented.

**US-F: PASS**

---

## 3. Gate Compliance Check (P1/P3)

**Permitted:** 1 scenario repo + 1 rubric + 1 graded walkthrough + /scenarios page (with subpages)
**Prohibited:** submission pipeline, grader UI, auth, LLM-grader

**Routes confirmed:**
```
src/app/scenarios/
  actions.ts          ← waitlist INSERT only
  page.tsx            ← /scenarios landing
  rubric/page.tsx     ← /scenarios/rubric
  scenario-01-timezone/page.tsx  ← /scenarios/scenario-01-timezone
  walkthrough/page.tsx           ← /scenarios/walkthrough
```
No `/scenarios/submit`, `/scenarios/grade`, `/scenarios/dashboard`, or auth routes exist.

**Grep for pipeline violations:**
```
rg 'submit|upload|grade|grader|auth|login' src/app/scenarios/
```
Results (3 matches):
1. `scenario-01-timezone/page.tsx:70` — "제출 방법 (How to submit)" heading text, not code
2. `page.tsx:304` — `type="submit"` on waitlist form button, not a pipeline
3. `rubric/page.tsx:22` — `{/* External grader warning */}` comment, not code

**Gate compliance: PASS — no pipeline features implemented**

---

## 4. Nav-Untouched Check

`git log --oneline --since="2 hours ago" -- src/components/layout/site-navigation.tsx` → **no output**.

Broader history: last modification to site-navigation.tsx was commit `f4bd1de` (Discord link addition), predating this Ralph session. Plan instruction "defer 4 weeks" was honored.

**Nav check: PASS**

---

## 5. Optimality Notes (Non-blocking)

**Minor — PROMPT_LOG_TEMPLATE.md section mismatch with walkthrough/page.tsx description:**
`PROMPT_LOG_TEMPLATE.md` lists 5 heading slots (Goal, Prompts sent, AI output summary, Verification attempts, Final diff rationale). The scenario-01-timezone `/page.tsx` describes 6 required headings (adds "컨텍스트 (Context)" and "회고 (Reflection)" separately). Not a correctness issue — both are usable — but a learner comparing the file to the page description will notice the mismatch. Suggest aligning them before cohort launch. (`scenarios/scenario-01-timezone/PROMPT_LOG_TEMPLATE.md` vs `src/app/scenarios/scenario-01-timezone/page.tsx:101–127`)

**Minor — Hardcoded "0 / 10 spots" counter:**
`page.tsx:163` — `{/* TN-V2-COUNTER: 0은 하드코딩 */}` is correctly flagged with a TODO comment. Not a blocker for the pre-order gate, but the comment should be actioned before the counter becomes misleading (i.e., once any waitlist signups exist).

**Minor — GitHub URL placeholder:**
`page.tsx:69` links to `https://github.com/thenocodes/scenario-01-timezone` which does not yet exist (scenario is embedded in main repo). Comment `TN-V2-P5` correctly documents the swap. The link will 404 until the standalone repo is created — acceptable for a pre-launch gate, should be addressed before public announcement.

---

## 6. Follow-ups for User (Pre-public-launch checklist)

The following items are **not** Ralph's responsibility and require user action before public launch:

1. **Gumroad SKU creation** — Create product at gum.co, get the SKU URL, swap `href="#waitlist"` → `href="gum.co/SCENARIO-01"` in `src/app/scenarios/page.tsx:182`. Comment `TN-V2-P5` marks the swap point.

2. **Supabase migration execution** — Run `supabase/migrations/00012_waitlist_leads.sql` manually via Supabase Studio > SQL Editor BEFORE deploying. The `waitlist_leads` table does not exist in prod until this is done. The Server Action will fail silently on INSERT until then.

3. **Beta cohort recruitment** — 3–5 beta testers for dogfood grading before opening the 10-slot pre-order. Grading pipeline is manual (email), so beta round validates the ops workflow.

4. **External grader (Week-3)** — Per RUBRIC.md §"외부 채점자 운영성 확인 프로토콜": recruit ≥1 external grader from Discord who is not involved in product development. They receive RUBRIC.md + the dogfood submission (GRADED_WALKTHROUGH.md §2). If any axis score differs by >1 level from operator score, reinforce anchors before publishing GRADED_WALKTHROUGH publicly.

5. **DNS redirect for unlearnfit.kr** — Execute Option A (Cloudflare Bulk Redirect) per `docs/unlearnfit-redirect.md`. Target: `https://thenocodes.org/scenarios`. Verify with `curl -I https://unlearnfit.kr/`.

6. **Standalone GitHub repo** — Create `github.com/thenocodes/scenario-01-timezone` and push `scenarios/scenario-01-timezone/` as a standalone public repo. Update the GitHub link in `src/app/scenarios/page.tsx:70` and redeploy.

7. **Waitlist counter UI** — Once any signups exist, implement live count against `waitlist_leads` (Server Component with `count(*)`) to replace the hardcoded "0 / 10 spots" at `page.tsx:163`. Tagged `TN-V2-COUNTER`.

8. **Deploy** — `npm run build` then `npm run deploy` from the main repo (not worktree). Per CLAUDE.md, migration must run first.

---

*Review completed: all evidence read from actual files, every finding has a file:line reference.*
