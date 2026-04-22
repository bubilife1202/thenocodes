# Ralph completion summary — Rev5 iter2 "AI-Assisted Scenario" pivot (content lane)

**Date:** 2026-04-22
**Plan:** `.omc/plans/thenocodes-integration-v2-ai-real-problem.md` (Critic iter-2 APPROVE)
**PRD:** `.omc/prd.json` (stories US-A..US-F shipped; US-V verification closed)
**Gate:** P1/P3 — content artifacts + `/scenarios` page only. Gate intact.

---

## 1. Shipped

### Content artifacts (under P3 relaxation, pre-order-legibility scope)

- **Scenario #1 repo** — `scenarios/scenario-01-timezone/`
  - `src/formatMeetupDate.ts` — planted Bug A (weekday read from UTC day) + Bug B (date-advance `> 24` vs `>= 24`).
  - `src/formatMeetupDate.test.ts` — 3 vitest cases: 1 fails (Bug A), 2 pass (both hide Bug B).
  - `SCENARIO.md` (learner-facing), `SOLUTIONS.md` (private-tagged), `PROMPT_LOG_TEMPLATE.md`, `README.md`, `package.json`, `tsconfig.json`.
  - Run: `cd scenarios/scenario-01-timezone && npm install && npm test` → **1 failed, 2 passed.**
- **Rubric** — `scenarios/RUBRIC.md` (3 axes × 4 levels × ≥2 behavioral anchors = 24+ anchors; grading protocol; external-grader operability warning at top).
- **Graded walkthrough** — `scenarios/GRADED_WALKTHROUGH.md` (dogfood C/V/I = L3/L3/L3; L±1 contrasts on all 3 axes; F2 validity disclaimer at top; prompt log includes the moment Bug B was caught).

### Landing surface

- `src/app/scenarios/page.tsx` — 7 sections (hero · scenario preview · rubric summary · walkthrough excerpt · pricing · FAQ · waitlist) + `submitWaitlist` Server Action.
- `src/app/scenarios/scenario-01-timezone/page.tsx` — scenario detail.
- `src/app/scenarios/rubric/page.tsx` — full rubric render.
- `src/app/scenarios/walkthrough/page.tsx` — walkthrough render with validity disclaimer.
- `src/app/scenarios/actions.ts` — Zod + honey-pot + service-role insert into `waitlist_leads`.

### Infra

- `supabase/migrations/00012_waitlist_leads.sql` — table + RLS (default-deny) + `lower(email)` unique index + `created_at` index. **Execution pending: user must run via Supabase Studio > SQL Editor before `npm run deploy`.**
- `docs/unlearnfit-redirect.md` — 301 redirect spec (Cloudflare Bulk Redirect preferred over Worker route).

### Verification

- `npm run build` at monorepo root → **exit 0.** All 4 `/scenarios` routes compiled.
- Lane A tests → **1 fail / 2 pass.**
- Grep for `simulator|실무 시뮬레이션|진짜 문제|Real Problem|UnlearnFit|unlearnfit` in `src/app/scenarios/` and `scenarios/` → **0 matches.**
- Nav untouched (`src/components/layout/site-navigation.tsx` last modified in f4bd1de, pre-Ralph).
- Architect review → **APPROVE** against US-A..US-F acceptance criteria (see `.omc/plans/architect-ralph-review.md`).
- Deslop pass → 3 spoiler-comment blocks removed from `formatMeetupDate.ts` + test file (bugs were being described to learners in source); 2 narrator comments removed from `src/app/scenarios/page.tsx`. Build + tests re-verified post-deslop.

---

## 2. Blocked on user action (P1/P3-gated or external)

### Required BEFORE `/scenarios` goes live

1. **Run `00012_waitlist_leads.sql`** in Supabase Studio SQL Editor (per CLAUDE.md deploy protocol).
2. **Confirm Korean brand phrase for hero** — current copy uses Planner recommendation ("AI와 함께 실전 시나리오를 풀고…"). If user prefers alternative, edit `src/app/scenarios/page.tsx:30-35`.
3. **5-second test** (S3 pre-commit trigger, unified with TN-V2-P4 acceptance) — 3 outside readers must answer "what do you get for 19,900원?" in 1 sentence. <2/3 → rewrite hero before launch.

### Required BEFORE pre-order flow works

4. **Gumroad SKU creation** — create "더노코즈 AI-Assisted Scenario #1 — 사전 구매" at 19,900원, cap 10. Swap CTA href in `src/app/scenarios/page.tsx` (line with `{/* TN-V2-P5: ... */}` comment) from `#waitlist` to `gum.co/NEW_SKU`.
5. **External-grader operability check** (TN-V2-P2) — recruit ≥1 external grader via Slack DM, have them score the dogfood submission using only `scenarios/RUBRIC.md`. Disagreements >1 level on any axis → tighten anchors before public walkthrough ship.
6. **DNS redirect for `unlearnfit.kr`** — follow `docs/unlearnfit-redirect.md` Option A (Cloudflare Bulk Redirect, 301 → `https://thenocodes.org/scenarios`).

### Required for first cohort (Week-3)

7. **Beta cohort recruitment** — 3-5 testers via 더노코즈 Discord. Beta price open question (Planner rec: 9,900원).
8. **Inter-rater validity test** — operator + 1 external grader independently score 2 of 5 beta submissions. Log disagreement rates per axis. >1-level disagreement on ≥50% of axes → halt grading, recalibrate.
9. **Week-4 signal gate evaluation** — 4 thresholds + 3-of-4 branch per Plan §6.

### Deferred (post-launch)

- Standalone GitHub repo for `scenarios/scenario-01-timezone/` (currently monorepo subtree; button in `/scenarios` page links to `github.com/thenocodes/scenario-01-timezone` which 404s until the repo is published).
- Live Supabase counter for "N/10 spots" (hardcoded 0 with `{/* TN-V2-COUNTER */}` marker).
- Nav entry placement (Architect S-B: defer 4 weeks; revisit with Week-4 data).
- Rev4 TN-P1 Neon → Supabase waitlist data migration (if any live rows exist on old Vercel deploy).
- Neon + Vercel teardown at T+14 post-cutover.
- FU3: AI-assisted grader v3 after ≥20 human-graded submissions.

---

## 3. Open questions still requiring user decision

Carried from `.omc/plans/open-questions.md` + Plan §9:

- **Revenue/throughput framing:** ~4.8M원/yr ceiling at cap — positioning exercise or sustainability target? (Planner stance: positioning.)
- **"언러닝 시대" framing half-life:** 12-24mo historical for similar positioning. Rollback plan for copy if term ages poorly?
- **Consulting-vs-product signal interpretation:** Week-2 reviewer says "this looks like paid office hours" — pass or fail signal? (Planner stance: pass IF reviewer also articulates rubric+repeatability differentiator; fail otherwise.)
- **Beta cohort pricing:** free / 9,900원 / 19,900원-with-smaller-cohort? (Planner rec: 9,900원.)
- **P4 recursion guardrail strictness:** strict no-AI in v2 grading (current) vs transparent first-pass reviewer with human override shown inline? (Planner stance: strict.)
- **`unlearnfit.kr` retention horizon:** 12mo hold then lapse vs indefinite? (Inherited from Rev4; still open.)
- **`hello@thenocodes.org` + SPF/DKIM/DMARC** for grading-feedback delivery (FU6).

---

## 4. Risk register (what Week-3/4 will tell us)

- **S1 rubric arbitrariness** — triggers: ≥30% of beta surveys "arbitrary" → freeze + 3-external-grader calibration.
- **S2 AI-graded AI-assisted recursion trap** — v2 fully human-graded by product owner. v3 gated on ≥20 calibrated submissions.
- **S3 pricing-illegibility** — 5-second test with 3 readers before launch; <2/3 → rewrite.
- **S4 self-referential dogfood** — mitigated by L±1 contrast requirement (present) + external grader check (pending).

---

## 5. What Ralph did NOT implement (correctly)

- No submission pipeline (learner upload UI) — P1-gated.
- No grader dashboard — P1-gated.
- No auth — P1-gated.
- No LLM-grader — P4 recursion guardrail.
- No Gumroad payment logic beyond CTA link — user-task.
- No nav restructure — Architect S-B defer 4 weeks.

These will unlock only when Rev5 P3 relaxation auto-rescinds at ≥10 pre-orders — per Plan §1 P3 decision rule.
