# TheNoCodes Integration v2 — "AI-Assisted Scenario" Pivot (RALPLAN-DR)

**Status:** iter 2 — addresses Critic iter-1 ITERATE (F1-F8)
**Mode:** DELIBERATE (product-positioning + content pivot layered on the still-open Rev4 migration plan — compounded risk)
**Author:** Planner
**Date:** 2026-04-22
**Supersedes (partial):** Rev4 `.omc/plans/thenocodes-integration-v1.md` (cbb11b7) — infra inherited; product-surface revised
**Locked premise (from Rev4):** Brand = 더노코즈. Stack = Next.js 16 App Router + Tailwind v4 + Supabase + Cloudflare Workers (OpenNext). Retire UnlearnFit brand, `unlearnfit.kr`, Vercel + Neon.
**New premise (this Rev):** Product thesis = "AI-Assisted Scenario" — a structured training unit in the 언러닝(unlearning) era that teaches learners to **direct AI, verify its output, and iterate**, not "type every line yourself."

> **Branding note (F3 resolution, Option a):** We rename "Real Problem / 진짜 문제" to "Scenario / 실전 시나리오" across product name, SKU, hero, route branding, and copy. The launch artifact (Problem #1 below) is a seeded-bug scenario — honest framing. "Real Problem" may return in future cohorts if and only if content is genuinely community-sourced (see ADR FU1).

---

## Iteration Log

**iter 1 (2026-04-21) — Critic verdict: ITERATE.** 3 Architect findings (A1/A2/A3) materially unaddressed + 1 new collision (F4) + 2 WEAK quality gates (G1, G4). 8 required fixes enumerated.

**iter 2 (2026-04-22) — this document.** Fixes resolved:
- **F1:** P3 closed via Option a (hard decision rule + auto-rescind gate). §1, §4, §10, Open Questions updated.
- **F2:** Operability-vs-validity split in TN-V2-P3 acceptance; external-grader check added to TN-V2-P2; inter-rater test added to §6 Week-3.
- **F3:** Option a (rename). "Real Problem / 진짜 문제" replaced with "Scenario / 실전 시나리오" throughout.
- **F4:** Route `/problems` → `/scenarios`. Aligns with F3; no collision with existing `/problem-bank` (which remains for algorithm problems). Open Question #2 closed; new entry documents the resolution.
- **F5:** TN-V2-P3 acceptance tightened to "2 of 3 beta-candidate readers from 더노코즈 Discord agree in writing..."
- **F6:** TN-V2-P4 acceptance unified with S3 trigger (≥2 of 3 recognizable; <2-of-3 = rewrite).
- **F7:** S4 pre-mortem added (self-referential dogfood). Refund policy §12 written.
- **F8:** Week-4 "3-of-4 met" branch defined (iterate one cohort on failing signal; defer Problem #2).

---

## 1. Principles (5)

**P1. Teach the new craft, not the old one.**
The old craft (write every line yourself) is what learners are *unlearning*. The product's value proposition is explicitly the new craft: **direct AI + verify AI + iterate on AI**. Any copy, rubric, or scenario that implicitly rewards "not using AI" is a bug, not a feature.

**P2. Scenarios must have an external correctness signal.**
A "Scenario" must have a verifiable correctness signal external to the learner's own judgment (tests pass, data reconciles, API responds correctly, measurable KPI moves). No puzzle boxes, no "describe how you would approach this" essays. *Note:* "external signal" applies to the scenario's pass/fail axis. The *grade* (Collaboration/Verification/Improvement) is orthogonal — it measures the process of reaching the signal, not the signal itself.

**P3. P1 gate relaxes narrowly; auto-rescinds on trigger. (decision rule)**
Rev4's "no simulator code until 10 pre-orders" was anti-over-build insurance. P3 codifies the one permitted exception: **P1 gate relaxes ONLY for content artifacts directly required for pre-order legibility — specifically, 1 scenario + 1 rubric + 1 graded walkthrough. Relaxation is rescinded automatically the day ≥10 pre-orders land, at which point the original P1 gate reasserts for any further scope. No other exceptions without rescinding + rewriting P1.** Submission pipeline, auth, grading UI, scoring automation — all gated as before.

**P4. Recursion guardrail on AI-graded AI-assisted work.**
If the grader is an LLM judging LLM-assisted output, we are building a hall of mirrors. First version of the rubric must be **human-graded by the product owner** (the user), with AI assistance at most as a first-pass reviewer whose output the human always overrides. Automation of grading is a follow-up — explicitly not in v2.

**P5. Additive to thenocodes core, not disruptive.**
thenocodes = 한국 AI 해커톤·공모전·밋업 aggregator + community + builder signals. "Scenarios" lives as a sibling surface under the umbrella, reachable from community/signals but not crowding the aggregator nav. Existing users must not feel the site changed genre overnight.

---

## 2. Decision Drivers (top 3)

**D1. Pre-order legibility.** A buyer handing over 19,900원 must answer "what am I getting?" in one sentence. "실무 시뮬레이션" fails; "1 scenario + rubric + 1 graded walkthrough" passes.

**D2. Thesis defensibility under a 30-second AI-era objection.** The product's answer to "why not just ask Claude?" is: "because the skill is *directing* the AI and *verifying* its output — we teach that, measure it, and give you feedback." The plan must operationalize this answer, not sloganeer it.

**D3. Time-to-legible-page vs risk of over-scoping.** Target: 1 scenario + rubric + graded walkthrough visible within 1 week of plan approval. A 6-week rubric study defeats momentum; a "trust us" landing defeats legibility.

---

## 3. Viable Options (per axis)

### Axis A — What IS a "Scenario"?

| Option | Unit of work | Correctness signal | Pros | Cons |
|---|---|---|---|---|
| **A1. Bug-fix on a seeded repo** | Learner forks a repo with a failing test, directs AI to diagnose + fix, submits PR + reflection log. | Tests pass/fail (deterministic). | Cheap to author; correctness self-evident; rubric grades *how* not *whether*. Surfaces verification skill (AI often proposes a fix that breaks another test). | Requires repo seeding + CI; learner needs some toolchain baseline. |
| **A2. Small-feature build on a scaffold** | Scaffold ships 80% wired; learner adds one endpoint/page/data transform via AI. | Integration test + manual acceptance checklist. | Feels like real product work. | Harder to grade uniformly. |
| **A3. Data/analytics reconciliation** | Messy CSV + target report; direct AI to transform and explain. | Expected-output diff. | Non-coders accessible; Korea 실무 analysts relevant. | Narrow. |
| **A4. Design/PRD critique** | Flawed spec; direct AI to surface assumptions. | Rubric-only; no deterministic signal. | Broad audience. | Fails P2. Reject. |
| **A5. Prompt-engineering exercise only** | "Write better prompts" task. | N/A. | Popular. | Commoditized; fails D2. Reject. |

**Recommendation — A1 anchor; A2/A3 for variety across curriculum.**
~~A4~~: no correctness signal (P2). ~~A5~~: commoditized (D2).

**Scenario #1 — "The flaky timezone test" (A1 anchor)**
- Seeded repo: small Next.js app with `formatMeetupDate(utc, tz)` util. Test suite: 1 visibly failing test on a DST boundary; 2 passing-but-hiding a Seoul-TZ bug at `hour === 0`.
- Task: direct AI to fix the failing test without breaking passing ones; surface the hidden bug.
- Deliverables: PR diff + 1-page reflection log ("what I asked AI, what it got wrong, how I caught it, what I changed") + prompt log in required markdown template (see Open Question #3).
- Graded on: **Collaboration** (decomposed task or god-prompt?), **Verification** (caught the hidden bug or accepted first answer?), **Improvement** (final diff handles DST + midnight cleanly?).

**Scenario #2 — "The hackathon CSV reconciler" (A3 variant)**
- Two CSV exports of 더노코즈 해커톤 listings from different sources, seeded with format inconsistencies and duplicate-but-different titles.
- Task: direct AI to produce a canonical merged CSV; document 3 edge cases caught that AI missed first pass.
- Graded on: same 3 rubric dimensions. Bonus: best submissions inform 더노코즈's actual hackathon data pipeline (P5 synergy).

### Axis B — Evaluation rubric design

| Option | What | Pros | Cons |
|---|---|---|---|
| **B1. 3-axis × 4-level, human-graded** | Collaboration (1-4) · Verification (1-4) · Improvement (1-4). Each level ≥2 concrete anchors. Graded by user in v2. | Honors P4. Concrete anchors make grading reproducible. Fits one page. | Human-grading caps throughput. Bus-factor-1. |
| **B2. Single-score 1-10 + paragraph** | Holistic. | Fast. | Not training-legible; steelman: some bootcamp graders prefer for speed, but learner can't tell *what* to improve — fails the teaching-legibility criterion that drives D2. Reject. |
| **B3. AI-assisted grader, human-reviewed** | LLM pre-grades, human overrides. | Scales. | P4 recursion risk without calibrated human baseline. Defer to v3 after ≥20 B1-graded submissions. |

Concrete rubric anchors (samples):
- **Collaboration-L3 anchor:** "Learner broke the task into ≥2 sub-prompts with explicit acceptance criteria per sub-step; relevant code/constraints attached rather than relying on AI to guess."
- **Verification-L4 anchor:** "Learner identified ≥1 AI error *before* submission, documented the failure mode (hallucinated API, off-by-one, wrong timezone assumption), and validated the fix against an independent signal (different test, manual probe, second model as checker)."
- **Improvement-L2 anchor:** "Learner iterated ≥1 on AI output but did not converge — final submission is AI's second attempt, not a reasoned synthesis."

**Recommendation: B1 for v2; B3 is v3 follow-up after ≥20 B1-graded submissions.**

### Axis C — Pricing & Gumroad SKU framing

| Option | SKU title + price | Pros | Cons |
|---|---|---|---|
| **C1. 19,900원, "Scenario #1 + rubric + 1 human-graded feedback"** | Concrete deliverable. | Price anchor preserved from Rev4; legibility. | Throughput cap. |
| **C2. Two-tier: 9,900원 problem-only + 29,900원 full** | Funnel broadens. | Complicates page/Gumroad/expectation. |
| **C3. Free for first 10** | Max feedback-signal. | Breaks Rev4 pre-order validation metric. Reject. |
| **C4. 19,900원 + cap N with visible counter** | Urgency + throughput-safe. | Mild cheesiness risk. |

**Recommendation: C1 + C4 hybrid — 19,900원, cap 10 pre-orders with counter.** Post-10-cohort, revisit tiering (C2) once throughput data exists. ~~C3~~: loses validation signal.

### Axis D — Integration-plan deltas vs Rev4

Inherited (unchanged): Stack, data preservation of Neon `waitlist_leads`, `unlearnfit.kr` 301 redirect mechanism, Tailwind v4 port.

Revised:

| Rev4 decision | Rev5 revision | Reason |
|---|---|---|
| Route = `/simulator` | **Route = `/scenarios` (Korean label: "실전 시나리오")** | F3+F4 resolution. Avoids `/problem-bank` collision; matches Scenario branding. |
| `unlearnfit.kr` 301 → `/simulator` | **301 → `/scenarios`** | Follow new route. |
| 5-tab carousel (RAG/Agent/LangChain/Eval/PE) | **Replaced: 1 scenario + rubric + graded walkthrough block** | Carousel was UnlearnFit's teaser; pivot teases "here's an actual scenario + how we grade." |
| P1 gate = "no simulator code until 10 pre-orders" | **P1 gate = decision rule P3 (§1): content permitted for pre-order legibility only; auto-rescinds at 10 pre-orders** | Closed principle, not drift. |
| Gumroad SKU = "더노코즈 실무 시뮬레이션" | **SKU = "더노코즈 AI-Assisted Scenario #1"** | F3 rename. |
| Nav under "제품" | **Under "러닝" (thesis-neutral) — OR defer nav placement 4 weeks per Architect S-B (open question)** | "제품" generic; "언러닝" risks marketing-cute; Architect suggests defer. |

Existing Rev4 `TN-P0..P7` (infra) remain valid. This Rev adds `TN-V2-P*` tasks (content) interleaved but not replacing the infra sequence.

### Axis E — Positioning vs thenocodes core

| Option | Depth | Pros | Cons |
|---|---|---|---|
| **E1. Sibling surface, lightly linked** | `/scenarios` under umbrella with own hero. Cross-promote via 1 community post + 1 signal entry at launch. | Minimal blast radius. | Misses synergy. |
| **E2. Woven — community-sourced scenarios** | Scenarios #2+ solicited via `/scenarios/propose`; credit proposers; signal feed posts new scenarios. | Flywheel; differentiation. | Coupling + QC burden; can't ship at launch. |
| **E3. Fully merged** | Restructure nav around "Learn / Do / Connect." | Clean IA. | Major nav rework; violates P5. |

**Recommendation: E1 at launch; commit publicly to E2 at T+3mo** (gated on ≥5 graded scenarios + stable rubric). ~~E3~~: too much churn for unvalidated product.

---

## 4. Recommended Decision (consolidated)

| Axis | Choice | One-line rationale |
|---|---|---|
| A Scenario unit | **A1 anchor + A2/A3 variety** | Tests-pass signal honors P2; mixed formats broaden audience. |
| B Rubric | **B1 — 3×4, human-graded v2** | Legible, reproducible, no recursion risk. |
| C Pricing/SKU | **C1 + C4 — 19,900원, cap 10 with counter** | Preserves baseline; safe throughput; concrete deliverable. |
| D Integration deltas | **Route `/scenarios`; content swap; P3 decision-rule gate** | Preserves Rev4 infra; closes gate-drift principle. |
| E Positioning | **E1 sibling at launch; E2 at T+3mo** | Minimal disruption; flywheel optionality. |

---

## 5. Pre-Mortem (4 scenarios)

**S1. "We build a rubric nobody trusts."**
*Symptom:* Beta learners read their feedback, respond "why is Verification L2? I disagree." Grades feel arbitrary; refund requests; no referrals.
*Root cause:* Anchors not concrete; grader applies inconsistently; no calibration.
*Mitigation:*
- Each rubric level has ≥2 behavioral anchors with quote-evidence.
- Before any paid grading: user grades a synthetic reference submission; publishes it as the sample graded walkthrough.
- Every paid feedback includes quote-level evidence.
*Trigger:* ≥30% of beta feedback survey reports "grade felt arbitrary" → freeze new pre-orders; re-do rubric calibration with 3 external graders before resuming.

**S2. "AI-graded AI-assisted work is a recursion trap."**
*Symptom:* Someone asks "is the grader an LLM?" v2 answer must be "no, human grader." When v3 adds LLM assist, thesis (verify AI) collides with implementation (trust AI grader). Narrative collapse.
*Root cause:* Scaling pressure tempts early LLM-automation before calibration.
*Mitigation:*
- P4 locked: v2 fully human-graded. Product page states "reviewed by 더노코즈 operator, not an LLM" — feature, not limitation.
- v3 AI-assist must always co-locate "human arbitrates" in the same UI module.
*Trigger:* "automated grading" never ships without co-located "human arbitrates" at code review.

**S3. "Learners can't tell what 'collaboration quality' means."**
*Symptom:* Buyer lands on `/scenarios`, reads "we grade your AI collaboration," bounces. Conversion <2%.
*Root cause:* 3-axis rubric is jargony without examples.
*Mitigation:*
- Page structure: (1) 1-line value prop, (2) Scenario #1 preview (no paywall), (3) rubric with anchors + inline L4-vs-L2 example, (4) graded walkthrough excerpt, (5) CTA.
- First sentence answers "why pay 19,900원 to be graded on AI use?" in the P1 "new craft" framing.
*Trigger:* **Before public launch, 3 unrelated readers take a 5-second test: "in one sentence, what do you get for 19,900원?" If <2 of 3 give a recognizable answer, rewrite hero + sample before launch.** (Unified with TN-V2-P4 acceptance, F6.)

**S4. "Dogfood walkthrough reads as marketing demo, not rubric application." (new, F7)**
*Symptom:* Reviewers can't distinguish "operator demonstrating rubric" from "operator selling the product." Internal-review signal is noise; dogfood proves operability but masquerades as validity.
*Root cause:* Self-authored + self-solved + self-graded is ~100% self-referential without explicit contrast.
*Mitigation:*
- Inter-rater check baked into TN-V2-P2 (see F2).
- TN-V2-P3 must include ≥1 L-below and ≥1 L-above contrast per axis (not just the grade given) — the walkthrough shows "why this is L3 and not L2 or L4."
*Trigger:* If ≥2 of 3 internal reviewers cannot name a rubric dimension the walkthrough *could* be lower on → walkthrough lacks contrast; rewrite before launch.

---

## 6. Expanded Validation Plan (4-week horizon)

### Week 1 — Dogfood pass (user = grader + first learner)
- User authors Scenario #1 end-to-end.
- User solves it with Claude Code; produces dogfood submission.
- User grades own submission against rubric; documents reasoning.
- **Success = one complete {scenario repo, rubric, graded walkthrough} triplet exists.**

### Week 2 — Internal review + rubric calibration (F2)
- Share triplet with 2-3 trusted builders via Slack DM.
- They review for: (a) clarity, (b) agree/disagree on grade, (c) would pay 19,900원.
- **External-grader check (F2, pre-TN-V2-P3 publication):** ≥1 external grader independently scores the dogfood submission using RUBRIC.md only. Disagreements >1 level on any axis trigger anchor tightening before walkthrough ships.
- **Success:** ≥2 reviewers can articulate the product in one sentence AND external-grader disagreements ≤1 level on all 3 axes after tightening.

### Week 3 — Soft launch + 3-5 beta testers + inter-rater validity test (F2)
- Publish `/scenarios` publicly; open pre-order cap 10.
- Recruit 3-5 beta testers from 더노코즈 Discord (beta price = open question, planner recommends 9,900원).
- Beta testers submit within 5 days.
- User grades each submission within 3 days.
- **Inter-rater validity test:** Two graders (operator + 1 external) independently score 2 of 5 beta submissions. Inter-rater disagreement rate is the primary validity signal. **>1-level disagreement on ≥50% of axes = rubric invalid, halt grading, recalibrate before continuing the cohort.**
- Collect written post-grading feedback: fair? learned what? recommend at 19,900원?

### Week 4 — Signal check (4 thresholds + 3-of-4 branch, F8)
Thresholds:
- **Pre-order conversion:** ≥3 paid pre-orders from non-beta traffic.
- **Beta quality:** ≥3 of 5 beta testers say "rubric felt fair" AND cite ≥1 specific learning.
- **Thesis defense:** ≥2 of 5 volunteer (unprompted) that verification/iteration framing was novel.
- **S1 arbitrariness:** <30% of beta surveys find grade "arbitrary."

Decision rule:
- **4 of 4 met:** commit to Scenario #2 + E2 roadmap.
- **3 of 4 met (F8):** iterate one more cohort on the specific failing signal; defer Scenario #2 authoring one week.
- **≤2 of 4 met:** freeze new pre-orders; re-enter discovery loop on rubric + scenario design.

### Observability (non-code)
- Private daily sheet: page views, pre-order starts/completions, beta-submission count, grading-queue depth.
- Plausible or CF Web Analytics event on pre-order CTA click (inherited from Rev4 FU2).

---

## 7. Execution Plan (layered on Rev4 TN-P*)

Task IDs: `TN-V2-P{n}` (pivot-specific). Rev4's `TN-P0..P7` (infra) still apply.

```
Rev4 infra lane:   TN-P0 → TN-P1 → TN-P2 ─────────────────→ TN-P3 → TN-P4 → TN-P5 → TN-P6 → TN-P7
Rev5 content lane:                TN-V2-P1 → TN-V2-P2 → TN-V2-P3 ──→ TN-V2-P4 → TN-V2-P5 → TN-V2-P6
```

Content lane kicks off at Rev4's TN-P2 (`/scenarios` page scaffold) and blocks TN-P5 (go-live).

### TN-V2-P1 — Scenario #1 authoring (Week 1, ~1 day)
**Objective:** Ship the seeded repo + failing test + hidden bug design + prompt-log template.

1. Scaffold small Next.js app repo (standalone `thenocodes/scenario-01-timezone` or monorepo subtree — Open Question #3).
2. Implement `formatMeetupDate(utc, tz)` with DST + midnight bugs.
3. Test suite: 1 visibly failing test, 2 passing-but-hiding-bug tests.
4. Write `SCENARIO.md` (learner-facing) describing the situation, deliverables, rubric link, **and prompt-log markdown template learners must use** (closes Open Question #3).
5. Private `SOLUTIONS.md` documents all 2 bugs with repro steps (not shipped to learners).
6. Verify `npm install && npm test` shows expected initial failure.

**Acceptance:**
- Repo scaffolded; initial `npm test` produces documented failure.
- `SCENARIO.md` self-contained; includes prompt-log template.
- `SOLUTIONS.md` private, documents 2 bugs with repro steps.

### TN-V2-P2 — Rubric doc + external-grader calibration (Week 1-2, ~1 day)
**Objective:** 3-axis × 4-level rubric with ≥2 behavioral anchors per cell + pre-publication external-grader operability check.

1. Draft `RUBRIC.md` — Collaboration / Verification / Improvement axes.
2. For each of 12 cells (3 × 4), write ≥2 concrete behavioral anchors referencing observable evidence (prompt-log quotes, diff size, test coverage).
3. Include grading protocol: what grader reads, weights, tie-breaking.
4. Self-test: pick hypothetical submission, grade in <30 min using only this doc; if no, tighten.
5. **External-grader check (F2):** Before TN-V2-P3 publication, recruit ≥1 external grader (Slack DM, not beta cohort). They score dogfood submission using RUBRIC.md only. **Disagreements >1 level on any axis → tighten anchors before publishing walkthrough.**

**Acceptance:**
- RUBRIC.md exists; every cell has ≥2 anchors; total ≤3 pages.
- User applies it to a test submission in ≤30 min.
- External-grader disagreements ≤1 level across all 3 axes after tightening pass.

### TN-V2-P3 — Dogfood submission + graded walkthrough (Week 1-2, ~1 day)
**Objective:** User solves Scenario #1 with AI; grades own submission with L+1/L-1 contrast per axis; establishes rubric **operability** (not validity).

1. User uses Claude Code to solve Scenario #1. Keeps full prompt log in the template format.
2. Produce: final PR diff + 1-page reflection log (as a learner would).
3. Grader hat: apply RUBRIC.md to own submission. Produce `GRADED_WALKTHROUGH.md` with scores + evidence quotes + **explicit L+1 and L-1 contrast per axis** (why this submission is L3 on Verification and not L2 or L4). [F7 S4 mitigation]
4. Sanitize personal info; prepare for `/scenarios` display.

**Acceptance (F2 + F5):**
- `GRADED_WALKTHROUGH.md` **demonstrates rubric operability — can be applied without internal contradiction. Validity is NOT claimed at this stage; Week-3 inter-rater check is the validity signal.**
- Each axis score includes ≥1 quote-evidence AND ≥1 L+1 contrast AND ≥1 L-1 contrast.
- **Reader verification:** 2 of 3 beta-candidate readers (recruited from 더노코즈 Discord, not operator's inner circle) agree in writing that `GRADED_WALKTHROUGH.md` exemplifies each rubric axis with at least one specific submission-quote as evidence.

### TN-V2-P4 — `/scenarios` page content (Week 2, blocks Rev4 TN-P5 go-live)
**Objective:** Replace Rev4's 5-tab carousel with pivot-aligned structure.

1. Page structure (top to bottom):
   - Hero: "**AI와 함께 실전 시나리오를 풀고, 어떻게 함께 풀었는지 평가받습니다.**" (subtitle: "언러닝 시대의 새로운 실력 — AI를 지휘하고, 검증하고, 개선하는 능력을 훈련합니다.")
   - Scenario #1 preview card (no paywall): link to SCENARIO.md or GitHub.
   - Rubric summary: 3 axes, 1-paragraph each, link to RUBRIC.md.
   - Graded walkthrough excerpt from GRADED_WALKTHROUGH.md with "see full" expander.
   - Pricing: 19,900원 pre-order, "N/10 spots" counter (server-rendered from Supabase count if possible, else hardcoded initial).
   - FAQ: includes "왜 LLM이 채점하지 않나요?" (S2 P4-as-feature framing).
   - Waitlist form (Rev4 port) for non-pre-order visitors.
2. Copy in Korean; analytical asides in English OK internally.
3. Replace all "실무 시뮬레이션" / "Real Problem" / "진짜 문제" phrasing with "Scenario" / "실전 시나리오." Keep 더노코즈 brand.

**Acceptance (F6, unified with S3):**
- Page renders on `npm run dev` + `npm run preview`.
- **5-second test (unified with S3 trigger):** ≥2 of 3 outside readers give a recognizable answer to "what do you get for 19,900원?" in one sentence. **<2 of 3 triggers S3 mitigation (rewrite hero + sample before launch).**
- No residual "simulator" / "실무 시뮬레이션" / "Real Problem" / "진짜 문제" copy except as deliberate reference to old framing.

### TN-V2-P5 — Gumroad SKU swap (coordinates with Rev4 TN-P6)
**Objective:** Replace Rev4 TN-P6's planned SKU with pivot SKU.

1. New Gumroad product: "더노코즈 AI-Assisted Scenario #1 — 사전 구매."
2. Description: 2-paragraph summary + link to `/scenarios`.
3. Price: 19,900원. Inventory cap: 10.
4. CTA on `/scenarios` switches from `#waitlist` anchor to `gum.co/NEW_SKU` at go-live.

**Acceptance:**
- Gumroad SKU live; test purchase end-to-end (refund self).
- Inventory counter decrements on test purchase.

### TN-V2-P6 — Beta cohort grading + feedback loop (Week 3-4)
**Objective:** Execute Week-3/4 validation plan including inter-rater validity test.

1. Invite 3-5 beta testers via 더노코즈 Discord.
2. Testers submit within 5 days; user grades each within 3 days.
3. **Inter-rater test (F2):** operator + 1 external grader independently score 2 of 5 submissions; log axis-level disagreement rates.
4. Post-grading survey sent.
5. Week-4 gate evaluated against 4 signals + 3-of-4 branch.

**Acceptance:**
- ≥3 beta submissions received.
- Each receives graded feedback doc.
- Inter-rater disagreement rates logged per axis.
- Signal-gate evaluation + branch decision logged in `.omc/plans/v2-week-4-validation.md`.

---

## 8. ADR (Architectural Decision Record)

**Decision:**
Pivot 더노코즈 integration from "실무 시뮬레이션" to "AI-Assisted Scenario" — curriculum that grades AI-collaboration, verification, and iteration via seeded scenarios with external correctness signals. Rev4 infra inherited unchanged. Product-surface revised: route `/scenarios`, content swap, Gumroad SKU title, P1 gate redefined as hard decision rule (P3).

**Drivers:**
1. Pre-order legibility (D1) — "실무 시뮬레이션" too abstract to buy.
2. Thesis defensibility (D2) — 언러닝-era "why not just ask Claude?" demands product whose whole point is answering it.
3. Time-to-legible-page (D3) — 1-week ship target, not 6-week pedagogy study.

**Alternatives considered:**
- *A4 PRD critique* — rejected: no external signal (P2).
- *A5 Prompt-engineering-only* — rejected: commoditized (D2).
- *B2 Holistic score* — rejected: not training-legible; speed-steelman doesn't outweigh teaching-legibility cost that defines D2.
- *B3 AI-assisted grader in v2* — deferred to v3: P4 recursion without calibrated baseline.
- *C3 Free for first 10* — rejected: loses pre-order validation signal.
- *E3 Fully merged nav* — rejected: too much disruption (P5).
- *"Real Problem" branding with seeded content* — rejected (F3): mis-advertisement; chose rename to "Scenario" for honesty. Community-sourced "Real Problems" may ship in post-launch cohorts (FU1).
- *Route `/problems`* — rejected (F4): collision with existing `/problem-bank` algorithm-problems nav entry.
- *Consulting-service framing (Architect steelman)* — considered and rejected as primary framing: the product is productizable via repeatable scenario+rubric format, not bespoke-per-learner. But **revenue reality: annualized ceiling ~4.8M원 at 2 scenarios/mo × 19,900원 × 10-cap means this SKU is positioning + validation signal, not a sustainability target** (see Consequences −).

**Why chosen:**
The combination (A1 anchor + B1 human-graded + C1/C4 capped + D-revised `/scenarios` + E1→E2 + P3 decision-rule gate) is the only path that (a) makes the product buy-able with a concrete deliverable, (b) operationalizes "direct AI + verify + iterate" rather than sloganeering, (c) preserves P4 recursion safety, (d) honors P5 non-disruption, (e) keeps the 4-week window realistic for solo operator, and (f) closes the P1-gate-drift principle loophole via P3's auto-rescind rule.

**Consequences (+):**
- Pre-order page legible; buyer self-describes product.
- Thesis has operational form — rubric, scenario, graded walkthrough.
- Human-grading is a *feature* (credibility vs LLM-graders).
- Naturally extensible to community-sourced scenarios (E2) and more curriculum units.
- Preserves Rev4 infra investment.
- P3 decision rule closes gate-drift risk.

**Consequences (−):**
- Throughput capped by grading capacity (≤10 pre-orders until v3 tooling).
- **Revenue ceiling ~4.8M원/year at cap — positioning exercise, not sustainability. User should commit this explicitly (see Open Questions).**
- Content authoring load real (~2-3 days per new scenario + walkthrough).
- Rubric calibration risk is biggest product risk (S1+S4); mitigations operational, not structural.
- Pivot invalidates Rev4 TN-P2/P4 content tasks; adds ~2-3 days before launch-ready.
- P1 relaxation permitted narrowly; auto-rescinds at 10 pre-orders.

**Follow-ups:**
- FU1. Scenario #2 + #3 authored by T+4 weeks if Week-4 gate passes; **attempt community-sourcing ≥1 scenario** to unlock "Real Problem" branding optionality.
- FU2. `/scenarios/propose` community form (E2) at T+3mo, gated on ≥5 graded scenarios + stable rubric.
- FU3. v3 grading assistance (B3) only after ≥20 human-graded submissions as calibration corpus.
- FU4. Revisit two-tier pricing (C2) once throughput data exists.
- FU5. Revisit nav IA (E3) if 더노코즈 grows to ≥3 distinct product surfaces.
- FU6. SPF/DKIM/DMARC + transactional email for grading-feedback delivery.
- FU7. Architect S-B option: defer nav section placement 4 weeks; decide with Week-4 data.
- FU8. Architect S-A hybrid rubric (anchor + self-grade + operator review) for v2.5 throughput relief.

---

## 9. Open Questions (must resolve before execution where gated)

Persist in `.omc/plans/open-questions.md`:

- [ ] **Nav section label:** "러닝", "언러닝", "학습", "제품", or defer 4 weeks per Architect S-B? — Planner recommends "defer 4 weeks"; ship hero-copy-sharp, nav-placement-deferred.
- [x] ~~Route name~~ — **Resolved F4:** `/scenarios` (avoids `/problem-bank` collision; matches Scenario branding).
- [ ] **Scenario repo location:** standalone GitHub (`thenocodes/scenario-01-timezone`), monorepo subtree (`examples/scenario-01/`), or post-purchase Gist? — Planner recommends public standalone (pre-purchase visibility is a legibility feature). **Required before TN-V2-P1.** Also closes prompt-log markdown template location (Architect gap).
- [ ] **Beta cohort price:** Free / 9,900원 / 19,900원 with "beta = same product, smaller cohort"? — Planner recommends 9,900원 with feedback expectation.
- [x] ~~P1 gate relaxation acceptance~~ — **Resolved F1 via P3 decision rule (§1).** User should still confirm the rule before TN-V2-P1.
- [ ] **Korean brand phrase for "AI-Assisted Scenario":** "AI 협업 실전 시나리오", "AI와 함께 푸는 실전 시나리오", "언러닝 실전 시나리오"? Affects page hero, SKU, downstream copy. **Required before TN-V2-P4 authoring.**
- [ ] **Recursion guardrail timing:** P4 strict (no AI in v2 grading). Alternative: transparent first-pass reviewer with human override shown inline. Planner stance: stricter; user decides.
- [ ] **Revenue/throughput commitment (Critic §9):** At cap (10 × 19,900원 × ~2 cohorts/quarter), annualized ≤4.8M원. Is this SKU positioning/validation or a sustainability target? Planner's current framing: **positioning exercise.** User confirmation needed — D1 reads differently if the answer is "positioning."
- [ ] **"언러닝 시대" copy half-life (Critic §9):** 12-24mo historical half-life for similar tech positioning. Copy-rollback plan if term ages poorly? Advisory (copy reversible).
- [ ] **Prompt-log markdown template (Critic §9):** Claude Code / Cursor / ChatGPT produce different log shapes. TN-V2-P1 must specify. Planner recommends: single markdown template accepting any source, with required headings (Goal / Prompts / AI output / Verification attempts / Final diff rationale).
- [ ] **Consulting-vs-product framing (Critic §9):** Week-2 reviewer says "this looks like paid office hours." Pass or fail signal? Planner stance: **pass signal if they also articulate the rubric+repeatability differentiator in the same breath; fail signal if the rubric is seen as conversational artifact only.** User confirms before Week-2 review.
- [ ] **Inherited Rev4 open questions** still pending: `hello@thenocodes.org` provisioning, PIPA re-consent, Gumroad transition details, unlearnfit.kr retention horizon. User should re-read Rev4 open-questions list in light of Rev5.

---

## 10. What Rev4 this plan invalidates vs preserves

**Preserved (no change):**
- Stack: Next.js 16 App Router + Tailwind v4 + Supabase + Cloudflare Workers (OpenNext).
- Neon `waitlist_leads` migration → Supabase (Rev4 TN-P1, TN-P3).
- Single Cloudflare Workers deploy (Rev4 TN-P5).
- `unlearnfit.kr` 301 redirect mechanism (target URL revised below).
- Tailwind v3→v4 port (Rev4 S4, TN-P2) — mechanical work required.
- Waitlist form + Server Action port — unchanged.
- Neon + Vercel teardown on T+14 (Rev4 TN-P7).
- Supabase RLS model for waitlist_leads (Rev4 TN-P1).

**Invalidated / revised:**
- Route `/simulator` → **`/scenarios`** (F4 resolves collision with existing `/problem-bank`).
- 5-tab carousel → Scenario + Rubric + Walkthrough block.
- Gumroad SKU "더노코즈 실무 시뮬레이션" → "더노코즈 AI-Assisted Scenario #1."
- P1 gate definition: "no simulator feature code" → **P3 decision rule (§1): content for pre-order legibility permitted narrowly; auto-rescinds at 10 pre-orders; submission pipeline / auth / grading UI still gated (F1 Option a).**
- Nav section label "제품" → "러닝" OR defer 4 weeks (Architect S-B, Open Question).
- Hero/page copy wholesale rewrite (simulation → scenario + AI collaboration).
- Gumroad inventory cap of 10 (new; Rev4 didn't cap).
- **Branding:** "Real Problem / 진짜 문제" → "Scenario / 실전 시나리오" (F3 Option a).

**Newly required (not in Rev4):**
- TN-V2-P1 Scenario #1 authoring + prompt-log template.
- TN-V2-P2 Rubric doc + external-grader operability check.
- TN-V2-P3 Dogfood submission + graded walkthrough with L±1 contrast.
- TN-V2-P6 Beta cohort + Week-4 validation gate + inter-rater validity test.

---

## 11. Deliverables (this plan)

- This file: `/Users/macmini_cozac/Code/thenocodes.org/.claude/worktrees/dreamy-golick-25433d/.omc/plans/thenocodes-integration-v2-ai-real-problem.md`
- Rev4 archival: `.omc/plans/thenocodes-integration-v1.md`
- Open questions append: `.omc/plans/open-questions.md` (Rev5 section)

---

## 12. Refund Policy (F7)

**Pre-orders are refundable in full within 7 days of graded-feedback delivery, no reason required.** A single click or email ("환불 요청") suffices. The learner keeps the scenario repo and rubric (non-gated content).

**Grade-disputes do NOT automatically refund.** If a learner disagrees with their grade, the disagreement is logged toward the Week-4 S1 arbitrary-feedback check (counted as a "grade felt arbitrary" data point). The learner may request one clarification pass from the grader (quote-level rationale on the disputed axis). Repeated or escalating disputes from the same learner default to a full refund to preserve signal integrity.

**Rationale:** Honors S1 (arbitrary-grade trigger requires real data, not refund-threat suppression) while respecting D1 legibility ("19,900원 for graded feedback; if you don't get it, you get your money back").

---

**Ready for Critic review (iter 2).**
