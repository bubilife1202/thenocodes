# Critic Review — TheNoCodes Integration Rev5 (V2 "AI-Assisted Real Problem"), iter 1

**Role:** Critic (RALPLAN-DR, DELIBERATE mode)
**Date:** 2026-04-22
**Reviewing:** `thenocodes-integration-v2-ai-real-problem.md` (Rev5, iter 1)
**Prior plan:** `thenocodes-integration-v1.md` (Rev4)
**Architect review consulted:** `architect-review-v2-iter1.md`
**Mode escalation:** Started THOROUGH; escalated to ADVERSARIAL after 3 MAJOR findings + 1 unaddressed systemic issue (namespace collision with existing `/problem-bank` nav entry).

---

## 1. Verdict

# **ITERATE**

The plan is salvageable and significantly improves over Rev4 on product legibility and thesis operationalization. But it **partially ignores 2 of the Architect's 3 flagged items** (A1 and A2), introduces a **principle-breach that the plan itself admits** (P3 "rationalized, not principled"), and carries a **concrete namespace collision** with the existing `/problem-bank` nav entry that neither Planner nor Architect fully resolved. These are fixable without a full rewrite, but they are not optional polish.

---

## 2. Pre-commitment Predictions (before detailed verification)

Predicted likely weak spots in a product-positioning pivot layered on a still-open migration:

1. P1 gate drift disguised as "content vs code" line — **CONFIRMED (MAJOR)**. Plan admits the rationalization.
2. "Real Problem" branding outrunning actual contrivance of seeded problem — **CONFIRMED (MAJOR)**. Problem #1 has pre-seeded bugs.
3. Dogfood as validation — a solo operator authoring/solving/grading their own walkthrough cannot produce validity evidence — **CONFIRMED (MAJOR)**.
4. Rubric inter-rater reliability untested — **CONFIRMED (MINOR, mitigation sketched in S1)**.
5. Korean copy not yet committed; multiple brand-phrase candidates still open — **CONFIRMED (MINOR, in open questions)**.

All five pre-commitment predictions landed. This tells me the Planner is aware of the stress points but did not close them in the plan text — they are deferred to Open Questions or to Architect feedback that the plan does not yet absorb.

Additional issue found during verification (not predicted): **namespace collision with existing `/problem-bank` in site-navigation.tsx:23**. This is a real-code issue, not a plan-level abstraction.

---

## 3. Quality Gate Scorecard (G1-G7)

### G1. Principle-option consistency — **WEAK**
Four of five principles actually constrain options:
- P1 (new craft) rules out A5 (pure prompt-engineering-only) ✓
- P2 (real problems, external signal) rules out A4 (PRD critique) and B2 (holistic) ✓
- P4 (no AI hall of mirrors) rules out B3 in v2 ✓
- P5 (additive) rules out E3 (full nav restructure) ✓
- **P3 (P1 gate evolves, does not vanish) — rules out nothing in the current option set.** P3 was written to justify the gate relaxation that the plan already decided to make. The Architect calls this correctly: "rationalized, not principled." **P3 is post-hoc decoration** unless the plan either (a) restates it with a decision rule that would rule out a plausible future exception, or (b) explicitly demotes it to advisory.

Rationale for WEAK (not FAIL): 4-of-5 is enough scaffolding; P3 is fixable with one paragraph.

### G2. Fair alternatives — **WEAK**
- Architect's steelman ("private Gumroad consulting gig") — **NOT CONSIDERED in alternatives**. This is the most damaging omission. The plan's own description (authored by operator, graded by operator, ≤10-per-cohort cap) looks structurally identical to a paid office-hours service with a rubric artifact. Not discussing why this is a "product" rather than "consulting with a rubric" is a gap in D2 defensibility.
- "Rename to 'Scenario' instead of 'Real Problem'" (Architect A3) — **NOT CONSIDERED in alternatives, not in open questions, not in ADR.** The plan uses "Real Problem" throughout while shipping a Problem #1 that has pre-seeded bugs (i.e., a Scenario by Architect's definition). Honest framing choice was never surfaced.
- B2 single-score rubric — dismissed in one line ("not training-legible. Reject.") without a steelman. Competitors do use holistic scores + paragraph feedback; some bootcamp graders do prefer it for speed. "Reject" without a real counter-argument is lazy. The rejection is probably correct, but the reasoning is thin.
- C3 free-for-first-10 — rejected reasonably with concrete metric reasoning (kills validation signal). ✓
- E3 full nav restructure — rejected reasonably via P5. ✓
- B3 AI-assisted grader — properly deferred (not rejected) with a concrete re-evaluation threshold (≥20 graded submissions). ✓

Rationale for WEAK: two material alternatives missing; existing rejections are uneven in quality.

### G3. Risk mitigation clarity — **OK**
S1/S2/S3 each have (a) symptom, (b) root cause, (c) operationally specific mitigation, (d) pre-commit trigger. Triggers are concrete:
- S1: ≥30% survey saying "arbitrary" → freeze pre-orders + 3-external-grader calibration.
- S2: "automated grading" must ship co-located with "human arbitrates" at code review.
- S3: 5-second test with 3 readers before launch; <2-of-3 = rewrite.

All three triggers are falsifiable and bound to a concrete decision. This is the strongest section of the plan.

One gap: **no pre-mortem scenario covers "the dogfood walkthrough lands as evidence of self-referentiality, not quality."** This is the Architect's §5 point (biggest methodological risk). Mitigation sketched indirectly in S1 but not called out.

### G4. Testable acceptance criteria — **WEAK**
- TN-V2-P1 acceptance ("Repo scaffolded, `npm install && npm test` shows expected initial failure; PROBLEM.md self-contained; SOLUTIONS.md documents 2 bugs") — **verifiable by a third party.** ✓
- TN-V2-P2 acceptance ("every cell has ≥2 anchors; total ≤3 pages; user can apply in ≤30 min") — partially verifiable. The ≤30 min test is self-reported; no inter-rater check. Architect called this out: add "two graders independently score dogfood submission; disagreements >1 level trigger rubric tightening." This is missing from TN-V2-P2 acceptance.
- TN-V2-P3 acceptance ("GRADED_WALKTHROUGH.md is a complete, coherent demonstration") — **unfalsifiable.** "Coherent demonstration" is not a third-party-verifiable criterion. "Someone reading it should think 'oh, I see what this teaches'" is subjective on "someone" and "think." Fix: define the reader (e.g., "2 of 3 beta-candidate readers agree in writing that the walkthrough exemplifies each rubric axis with a specific quote from the submission").
- TN-V2-P4 acceptance ("5-second test passes: 3 outside readers answer recognizably") — **verifiable but self-contradictory with S3 pre-commit trigger.** S3 says "before public launch, <2-of-3 triggers rewrite." TN-V2-P4 acceptance says ≥recognizable from 3 readers (unspecified threshold). Align: ≥2-of-3 is the pass bar (matching S3).
- TN-V2-P5 acceptance (Gumroad end-to-end + inventory decrement) — ✓
- TN-V2-P6 acceptance (≥3 submissions, each gets graded doc, signal-gate logged) — ✓

Rationale for WEAK: TN-V2-P3 fails the third-party-verifiable test; TN-V2-P2 is missing inter-rater; TN-V2-P4 conflicts with S3. Fixes are small but mandatory.

### G5. Concrete verification steps — **OK**
Week-4 gate (§6) has 4 numeric signals with explicit thresholds:
- ≥3 paid pre-orders from non-beta traffic
- ≥3 of 5 beta testers say "rubric felt fair" + cite specific learning
- ≥2 of 5 volunteer that verification/iteration framing was novel
- <30% find grade "arbitrary"

All four are falsifiable. Decision rule is explicit: **all 4 met → commit to Problem #2; ≤2 of 4 met → freeze new pre-orders**. This is what a proper Week-4 gate looks like.

Minor: "what if exactly 3 of 4 met?" is undefined. Fix: add a "3 of 4 met" branch (e.g., "iterate one more cohort on the failing signal before committing Problem #2").

### G6. Pre-mortem strength (DELIBERATE mode) — **OK**
Three scenarios (S1/S2/S3), each realistic and high-probability:
- S1 rubric calibration failure — realistic; matches industry pattern of solo-grader bootcamps.
- S2 recursion trap — thesis-defining; the whole product dies here if mishandled.
- S3 value prop illegibility — the problem Rev5 exists to solve; correctly self-aware.

Gap (as noted in G3): no scenario for "dogfood lands as self-referential evidence." Architect's §5 flagged this as the biggest methodological risk. Add S4 before approval.

### G7. Expanded test plan (DELIBERATE mode) — **WEAK**
§6 covers dogfood (Week 1), internal review (Week 2), beta cohort (Week 3), signal check (Week 4). Dogfood + internal review + beta + pre-order conversion signal — all four rungs are present. This is the structural requirement.

But:
- **Dogfood and validity evidence are conflated.** Architect §5: "self-authored + self-solved + self-graded = ~100% self-referential. Evidence of 'can operate rubric' not 'rubric measures real skill.'" The plan treats GRADED_WALKTHROUGH.md as BOTH marketing artifact AND calibration signal. These have to be separated (see A2 below).
- **No inter-rater reliability test.** Architect flagged this specifically. Without it, the Week-3 beta cohort can't tell "rubric felt arbitrary" from "grader was inconsistent" from "learner disagrees with valid grade."
- **Refund policy for grade-disagreement missing.** S1 mitigation triggers refund-adjacent behavior but no policy stated. What happens when a paid learner says "I disagree with L2 on Verification, I want my 19,900원 back"?

Rationale for WEAK: structure is there, rigor is not. Fixable.

---

## 4. Architect Findings Evaluation

### A1 — P1-gate relaxation principled-ness. **DEFERRED, not honestly.**
Architect demanded: "articulate new decision rule OR demote to advisory. Cannot claim both."

Plan's response: P3 principle + Open Question #5 ("Does the user accept the revised P1 gate?"). But §4/§7 proceed as if the relaxation is already adopted (TN-V2-P1..P3 are content work on the "relaxed" side of the gate). The plan writes it as a structural decision (preserved/invalidated table §10 explicitly revises the gate) while simultaneously parking the acceptance in Open Questions. **You cannot have both: either the gate is revised (and the principle needs a rule), or it's pending user acceptance (and TN-V2-P1..P3 shouldn't be plannable yet).**

Honest deferral: move "revised P1 gate" out of §10 Invalidated table and into "pending user decision," and hold TN-V2-P1..P3 behind the same gate. OR commit to the decision rule: "P1 relaxes only for pre-order-legibility content; relaxation is rescinded the day 10 pre-orders land." This closes the gate the day it's no longer needed.

Verdict: **UNADDRESSED.** Critic flags MAJOR.

### A2 — Dogfood rubric operability vs validity. **IGNORED.**
Architect demanded: "separate 'rubric operability' from 'rubric validity.' Push validity evidence to Week-3 beta. Add inter-rater reliability check."

Plan text in TN-V2-P3 acceptance: "GRADED_WALKTHROUGH.md is a complete, coherent demonstration of the rubric applied to a real submission. The graded walkthrough is itself persuasive — someone reading it should think 'oh, I see what this teaches.'"

This is exactly the conflation Architect flagged. "Persuasive" and "coherent demonstration" are operability signals — can the rubric be applied without internal contradiction. "Measures real skill" is a validity signal — does L3 on Verification mean the same thing when the grader is calibrated across 5 different submissions graded by 2 different people. **Plan has no validity signal.**

Week-3 beta has feedback signals ("did it feel fair?" "did you learn?") but those are learner-satisfaction proxies, not validity proxies. Validity requires inter-rater reliability or an external criterion. Neither is in the plan.

Verdict: **UNADDRESSED.** Critic flags MAJOR.

### A3 — Problem #1 "Real Problem" vs "Scenario" honesty. **IGNORED.**
Architect demanded: rename or replace. Plan did neither.

The plan's Problem #1 is explicitly a contrivance: "Two tests also look right but hide a Seoul-timezone bug when `hour === 0`." This is a seeded bug on a seeded repo. By Architect's framing (which is correct), this is a **Scenario**, not a **Real Problem**.

Problem #2 is described as community-sourced ("real data: two CSV exports of 더노코즈 해커톤 listings from different sources, deliberately inconsistent") — but "deliberately inconsistent" means deliberately seeded inconsistency by the operator, not organically inconsistent real data. Same issue.

The product name, nav label candidates, Gumroad SKU, hero copy all use "Real Problem" / "진짜 문제." If the launch problems are Scenarios, this is a material mis-advertisement. Fix options Architect listed (rename to Scenario, OR fast-track a truly community-sourced real problem) — neither is in the plan.

Verdict: **UNADDRESSED.** Critic flags MAJOR.

---

## 5. Hard Stop Check (REJECT triggers)

| Trigger | Status |
|---|---|
| Destroys data without backup | NO — Rev4 B1 data migration preserved in inheritance; Neon teardown gated behind 14-day buffer. |
| Bypasses P1 gate with code shipping before pre-orders | **AMBIGUOUS.** Plan says "no submission-pipeline / auth / grading-UI code" ships pre-gate. TN-V2-P1..P3 are content, TN-V2-P4 ships page content (inherited from Rev4 TN-P2 scaffold which IS code). The plan relies on Rev4's TN-P2 page being "just a port," but the waitlist form is code with Server Action + Supabase INSERT — that's product code by Rev4 P1's original intent. However, Rev4 P1 always permitted the waitlist form (it was the legibility artifact of Rev4), so this is inherited, not new. **NOT a hard-stop** but it reinforces the A1 finding. |
| No rollback path if pivot lands badly | **NO explicit rollback.** Plan has Week-4 "freeze new pre-orders" but no rollback to Rev4 product copy if Week-4 signals all fail. Fix recommended; not hard-stop (freeze is a de facto rollback). |
| Unfalsifiable success criteria | NO — Week-4 gate has 4 numeric thresholds (§6). |

**No hard-stop triggered. Proceeding to ITERATE, not REJECT.**

---

## 6. Specific Required Fixes (Planner must address before APPROVE)

Numbered in priority order. Each is concrete enough that Planner knows the exact change.

### F1 (MAJOR — addresses A1). Close the P3 decision rule OR demote P3 to advisory.
Pick one:
- **Option a (decision rule):** Replace P3 text with: "P1 gate relaxes ONLY for content artifacts directly required for pre-order legibility (1 problem + 1 rubric + 1 graded walkthrough). Relaxation is rescinded automatically the day ≥10 pre-orders land, at which point the original P1 gate reasserts for any further scope. No other exceptions without rescinding + rewriting P1."
- **Option b (demote):** Replace P3 with: "P3 (admin). P1 gate is now advisory; the original anti-over-build purpose is replaced by the Week-4 signal gate (§6)." Then remove P3 from the principle set (4 principles remain).

Do not ship both phrasings. Pick one; update §4, §10, and Open Question #5 to reflect the choice.

### F2 (MAJOR — addresses A2). Separate "rubric operability" from "rubric validity" in TN-V2-P3 and §6.
- Rewrite TN-V2-P3 acceptance to: "GRADED_WALKTHROUGH.md demonstrates the rubric can be applied without internal contradiction (operability). Validity is NOT claimed at this stage — Week-3 inter-rater check is the validity signal."
- Add to TN-V2-P2: "Before TN-V2-P3 publication, at least one external grader (Slack DM, pre-beta) independently scores the dogfood submission using only RUBRIC.md. Disagreements >1 level on any axis trigger rubric anchor tightening before publication."
- Add to §6 Week-3: "Two graders (operator + 1 external) independently score 2 of 5 beta submissions. Inter-rater disagreement rate is the primary validity signal. >1-level disagreement on ≥50% of axes = rubric invalid, halt grading, recalibrate."

### F3 (MAJOR — addresses A3). Resolve "Real Problem" vs "Scenario" framing.
Pick one:
- **Option a (rename, cheap):** Replace all instances of "Real Problem" / "진짜 문제" with "Scenario" / "실전 시나리오" or equivalent. Update product name, Gumroad SKU title, hero copy, route name (`/problems` → `/scenarios` or keep `/problems` with "Scenario" brand term).
- **Option b (fast-track real):** Before launch, source ≥1 genuinely community-sourced bug/problem from 더노코즈 Discord (not authored or seeded by the operator). Keep "Real Problem" branding, but anchor Problem #1 on community-sourced material; defer timezone-test to Problem #2 or supplementary material.

Plan currently tries to do both (use "Real" branding while shipping seeded Scenarios). Pick one.

### F4 (MAJOR — new issue, not in Architect findings). Resolve `/problems` vs existing `/problem-bank` nav collision.
`src/components/layout/site-navigation.tsx:23` already ships `{ label: "문제은행", href: "/problem-bank", tone: "neutral", description: "오리지널 알고리즘 문제" }`. The plan introduces `/problems` for a different product with a related label. Two things can happen:
- Users see both nav entries and cannot distinguish them.
- SEO/URL ambiguity: `/problems` vs `/problem-bank` vs future `/problem-bank/*` catalog pages.

Pick one:
- **Option a:** Rename new route to `/challenges` or `/scenarios` (matching F3 if chosen).
- **Option b:** Remove/rename the existing `/problem-bank` entry before `/problems` ships (and resolve what "문제은행" was supposed to mean).
- **Option c:** Explicitly nest: `/problem-bank/real-problem-01` etc., treating the new product as a branded entry in the broader problem bank.

Add to Open Questions with a "Required before TN-V2-P4" gate. Architect flagged this in §5 but plan did not address.

### F5 (MINOR — G4 testability). Make TN-V2-P3 acceptance third-party-verifiable.
Current: "someone reading it should think 'oh, I see what this teaches'" — unfalsifiable.
Replace with: "2 of 3 beta-candidate readers (recruited from 더노코즈 Discord, not operator's inner circle) agree in writing that GRADED_WALKTHROUGH.md exemplifies each rubric axis with at least one specific submission-quote as evidence."

### F6 (MINOR — G4 alignment). Align TN-V2-P4 acceptance with S3 pre-commit trigger.
S3 says <2-of-3 recognizable answers = rewrite before launch. TN-V2-P4 acceptance says "3 outside readers answer recognizably" without threshold. Unify: "≥2 of 3 outside readers give a recognizable answer to 'what do you get for 19,900원?' in one sentence. <2-of-3 triggers S3 mitigation (rewrite hero + sample before launch)."

### F7 (MINOR — G7 gap). Add S4 pre-mortem scenario + refund policy.
- S4: "The dogfooded walkthrough reads as a marketing demo rather than rubric application. Reviewers can't distinguish 'operator demonstrating rubric' from 'operator selling the product.' Internal-review signal is noise."
  - Mitigation: require inter-rater check (see F2); require TN-V2-P3 to include at least one L-below and one L-above contrast per axis, not just the grade given.
  - Pre-commit trigger: if ≥2 of 3 internal reviewers cannot name a rubric dimension the walkthrough *could* be lower on, the walkthrough lacks contrast — rewrite before launch.
- Refund policy (S1 gap): add a one-sentence policy to §8 FU list or a new §12: "Pre-orders are refundable in full within 7 days of the graded-feedback delivery, no reason required. Disputes on the grade itself do NOT automatically refund, but the learner's feedback is logged toward the Week-4 S1 arbitrary-feedback check."

### F8 (MINOR — G5 gap). Add a "3-of-4 met" decision branch to Week-4 signal gate.
Current: all-4 met → commit to Problem #2; ≤2-of-4 met → freeze. Define 3-of-4 behavior: e.g., "iterate one more cohort on the specific failing signal; defer Problem #2 authoring one week."

---

## 7. Items the Plan Got Right (retain through iteration)

1. **P4 anti-recursion guardrail.** Strongest principle in the plan. S2 pre-mortem operationalizes it (no "automated grading" ships without co-located "human arbitrates"). Turning "no LLM grader" into a marketing feature is both honest and defensible.
2. **Week-4 signal gate structure.** Four numeric thresholds with a decision rule (commit/freeze). This is what a real validation gate looks like — don't weaken it.
3. **E1 → E2 sequencing.** Launch sibling, defer community-sourcing to T+3mo with a concrete threshold (≥5 graded problems + stable rubric). Correct prioritization of reversible vs sticky decisions.
4. **Rubric anchor examples in §3 Axis B.** The Collaboration-L3, Verification-L4, Improvement-L2 sketches are concrete enough to show the format works. Keep these; expand to 12 cells × 2 anchors in TN-V2-P2.
5. **Preservation of Rev4 infra decisions intact.** Clean separation of "infra unchanged" (§10) from "product-surface revised" (§10). The ADR Follow-ups also correctly carry forward Rev4's unresolved items (SPF/DKIM/DMARC in FU6).

---

## 8. Verdict Justification

**ITERATE, not APPROVE, because:**
- 3 of Architect's 3 top findings are materially unaddressed (A1 deferred dishonestly, A2 ignored, A3 ignored).
- 1 additional MAJOR issue (F4 `/problem-bank` namespace collision) exists in the actual codebase that Architect flagged but Planner did not action.
- 2 WEAK quality gates (G1, G4) compound: P3 is post-hoc decoration, and one acceptance criterion is unfalsifiable.

**ITERATE, not REJECT, because:**
- No hard-stop triggers fired (data preservation intact; Week-4 gate falsifiable; rollback via freeze exists de facto).
- Risk mitigation (G3), verification thresholds (G5), and pre-mortem structure (G6) are genuinely strong.
- All 8 required fixes are small-to-moderate document edits. No structural rewrite needed.
- The pivot thesis (AI-assisted real problem as 언러닝-era craft) is genuinely better positioned than Rev4's generic "실무 시뮬레이션." The product-surface decisions are directionally right.

**Mode escalation:** Escalated to ADVERSARIAL after verifying that 3 of 3 Architect findings were unaddressed in the plan text (not just deferred to open questions). Adversarial sweep surfaced F4 (navigation collision in site-navigation.tsx:23) that was not flagged previously. No additional systemic issues found beyond F4.

**Realist Check applied:**
- F1 (P3 rationalization): stays MAJOR. Principle quality matters more in deliberate mode, not less. Not downgraded.
- F2 (rubric validity): stays MAJOR. Mitigated by Week-4 signal gate existing, but that's the detection layer, not the prevention layer. Detection after 5 paid learners have submitted is too late.
- F3 (Real vs Scenario honesty): stays MAJOR. This is branding vs product-reality alignment. Mis-advertisement is MAJOR, not MINOR.
- F4 (navigation collision): stays MAJOR. It's in committed code; it will break user experience at launch. Not speculative.

No downgrades from this check. F5–F8 are correctly MINOR.

---

## 9. Open Questions (unscored, Critic-added)

- **Revenue/throughput model.** Architect noted: annualized ceiling ~4.8M원 at 2 problems/month × 19,900원 × 10 cohort cap. Is this product a sustainability target or a positioning exercise? Plan should commit an answer (OK to say "positioning exercise, not revenue target"), because D1 (pre-order legibility) reads differently if the answer is "positioning."
- **"언러닝 시대" framing half-life.** Architect T3: 12-24 month half-life on similar tech positioning. Plan leans hard on 언러닝 in hero copy. Is there a copy-rollback plan if the term ages poorly? Minor; copy is reversible, so this is an advisory question.
- **Prompt-log capture format** (Architect §5). Claude Code vs Cursor vs ChatGPT produce different log shapes. TN-V2-P1 should specify a markdown template learners must submit. Minor but shippable-blocker for beta testers.
- **Consulting-vs-product framing (Architect steelman).** If a beta reviewer in Week-2 says "this looks like paid office hours with a rubric" — is that a pass signal or a fail signal? Plan needs to answer this before running the Week-2 review. Affects how Planner interprets the data.

---

## 10. Sign-off Checklist (for Planner ITER 2)

Before resubmitting for Critic APPROVE:
- [ ] F1: P3 closed (decision rule OR demotion — pick one, document in §1 and §10).
- [ ] F2: Operability/validity split in TN-V2-P3; inter-rater check added to TN-V2-P2 and §6 Week-3.
- [ ] F3: "Real Problem" vs "Scenario" resolved (rename OR fast-track community-sourced; update hero, SKU, route).
- [ ] F4: `/problems` vs `/problem-bank` collision resolved (rename OR nest OR remove).
- [ ] F5: TN-V2-P3 acceptance made third-party-verifiable.
- [ ] F6: TN-V2-P4 acceptance aligned with S3 threshold.
- [ ] F7: S4 pre-mortem scenario added; refund policy written.
- [ ] F8: 3-of-4 Week-4 branch defined.

---

## Ralplan Summary Row (DELIBERATE mode)

- **Principle/Option Consistency (G1):** WEAK — P3 is post-hoc decoration; 4 of 5 principles constrain.
- **Alternatives Depth (G2):** WEAK — consulting steelman and Scenario-rename not considered.
- **Risk/Verification Rigor (G3/G5):** PASS — 3 pre-mortem scenarios with falsifiable triggers; Week-4 gate has 4 numeric thresholds.
- **Deliberate Additions (G6/G7):** WEAK — pre-mortem missing S4 (self-referential dogfood); test plan missing inter-rater reliability and refund policy.

**Overall: ITERATE (iter 2 required).**

---

# Critic Review — iter 2 (2026-04-22)

**Role:** Critic (RALPLAN-DR, DELIBERATE mode)
**Reviewing:** `thenocodes-integration-v2-ai-real-problem.md` (Rev5, iter 2) after Planner revision + Architect iter-2 PROCEED
**Mode:** THOROUGH (did not escalate — all 8 fixes landed cleanly on first verification pass; no adversarial trigger)

---

## Part 1 — F1–F8 Verification

| Fix | Status | Evidence |
|---|---|---|
| **F1** (P3 decision rule OR demote) | **CLOSED** | §1 P3 (plan:39–40) installs a real decision rule with a binary, observable auto-rescind trigger (`"day ≥10 pre-orders land"`); §10 (plan:418) and Open Questions (`open-questions.md:45`) align as resolved. Not rationalization — actually rules out the next exception. |
| **F2** (operability/validity split + inter-rater) | **CLOSED** | TN-V2-P3 acceptance (plan:278–279) states `"demonstrates rubric operability — can be applied without internal contradiction. Validity is NOT claimed at this stage"`; TN-V2-P2 adds pre-publication external-grader check (plan:263); §6 Week-3 adds the inter-rater halt trigger (plan:208–209). All three layers present. |
| **F3** (Real Problem → Scenario rename) | **CLOSED** | Title, hero, SKU, route, rubric copy all renamed. Grep confirms residual `"Real Problem"` / `"진짜 문제"` strings survive only in (a) F3 resolution note, (b) ADR rejected-alternative entry, (c) invalidated-from-Rev4 table, (d) FU1 future-optionality. No live-surface leakage. |
| **F4** (`/problems` → `/scenarios`) | **CLOSED** | Independently verified `src/components/layout/site-navigation.tsx:23` still owns `{ label: "문제은행", href: "/problem-bank" }` for algorithm problems; new `/scenarios` route is orthogonal, no collision. Plan §3 Axis D, §7 TN-V2-P4, §10, Open Q #2 all consistent. |
| **F5** (TN-V2-P3 third-party-verifiable) | **CLOSED** | plan:281 replaces the unfalsifiable `"someone reading it should think..."` with `"2 of 3 beta-candidate readers (recruited from 더노코즈 Discord, not operator's inner circle) agree in writing that GRADED_WALKTHROUGH.md exemplifies each rubric axis with at least one specific submission-quote as evidence."` Falsifiable, bounded, external. |
| **F6** (TN-V2-P4 ↔ S3 alignment) | **CLOSED** | plan:299 explicitly invokes S3 threshold: `"≥2 of 3 outside readers... <2 of 3 triggers S3 mitigation."` Identical wording to §5 S3 (plan:178). No drift. |
| **F7** (S4 pre-mortem + refund policy) | **CLOSED** | §5 S4 (plan:180–186) adds the self-referential-dogfood scenario with L±1 contrast mitigation + a concrete trigger (`"≥2 of 3 internal reviewers cannot name a rubric dimension the walkthrough could be lower on"`). §12 (plan:440–446) is a standalone refund policy — 7-day no-reason, grade-disputes routed into S1 signal (not refund-suppression), escalating-disputes default-to-refund. Both well-formed. |
| **F8** (3-of-4 Week-4 branch) | **CLOSED** | §6 plan:219–222 defines all three branches (4/4, 3/4, ≤2/4) with distinct actions. No undefined middle case. |

**All 8 CLOSED. Zero PARTIAL. Zero OPEN.**

---

## Part 2 — Hard-Stop Recheck

| Trigger | Status |
|---|---|
| Destroys data without backup? | **NO** — Rev4 data preservation inherited (plan:411 teardown at T+14 with buffer). |
| Bypasses P1 gate with code shipping before pre-orders? | **NO** — P3 is now a real decision rule with auto-rescind; only content artifacts permitted; submission pipeline / auth / grading UI / automation still gated. |
| No rollback path? | **NO** — Week-4 `≤2 of 4` branch = freeze new pre-orders + re-enter discovery; `3 of 4` branch = iterate one cohort + defer #2. De facto rollback on both failure branches. Refund policy (§12) handles learner-side rollback. |
| Unfalsifiable success criteria? | **NO** — all TN-V2-P* acceptance criteria and Week-4 signals are now third-party-verifiable with numeric or count thresholds. |

**No hard-stop triggered.**

---

## Part 3 — Residual Items (non-blocking)

**A. Rev4 P5 atomic-cutover timing not re-stated in Rev5.** Architect flagged this in iter-1 §3 and iter-2 Part 3 and noted it is **still silently dropped**. Plan preserves `"Neon + Vercel teardown on T+14"` (plan:411) but does not re-state how TN-V2-P1..P6 interleave with TN-P5 cutover. Content lane `"blocks TN-P5 go-live"` (plan:239) is stated, but a reader cannot reconstruct whether cutover lands by any specific date. **Non-blocking for APPROVE; worth a 1-sentence planner clarification before execution begins** (e.g., "TN-P5 cutover targets Week-2 end, post TN-V2-P4 acceptance; Neon T+14 counts from cutover day, not plan-approval day"). Raise in sign-off checklist, not as a required fix.

**B. Filename still `v2-ai-real-problem.md` post-rename.** Intentional per Planner §11 (file-move cost + downstream linkage). Cosmetic artifact; documentation consistency weakened slightly. Acceptable to carry; rename is a cheap cleanup later (`git mv thenocodes-integration-v2-ai-real-problem.md thenocodes-integration-v2-scenario.md` + update references). **Non-blocking.**

**C. Operator-bandwidth binding constraint on 4/4 path.** Architect iter-2 Consensus Addendum T1 flagged: if Week-4 lands 4/4, commit-to-Scenario-#2 doubles authoring load before FU8 hybrid rubric ships. Plan has no explicit bandwidth ceiling ("how many simultaneous cohorts can operator grade in a week?"). Not a plan defect — an operational unknown surfaced for user awareness. **Flag in sign-off checklist as a user-decision item.**

**D. `open-questions.md:33` legacy entry.** The iter-1 Rev5 open-questions section (lines 30–39) still lists `/problems` as the recommended route and `"AI-Assisted Real Problem"` Korean phrasing — superseded by the iter-2 section (lines 41–58). Not wrong, but if a user greps for route name they'll see contradictory entries. **Minor — consider dropping or explicitly marking the iter-1 Rev5 block as superseded** (the iter-1 Rev4 block at lines 19–28 is fine, it documents a different plan).

None of A–D are APPROVE-blockers.

---

## Part 4 — Verdict

# **APPROVE**

All 8 iter-1 required fixes landed with plan-text changes (not aspirational language). No hard-stops. Architect iter-2 PROCEED converges with Critic iter-2 independent verification. The plan is now execution-ready modulo the user decisions listed below.

**Mode note:** Stayed in THOROUGH mode. No adversarial escalation warranted — revisions were substantive and precise; no pattern of hidden issues surfaced during gap analysis.

**Realist Check:** No severity recalibrations needed. Residuals A–D pressure-tested; all are operational or cosmetic, not product/principle defects.

---

### Sign-off Checklist (user decisions before execution)

Before the user greenlights TN-V2-P1 kickoff, confirm or decide:

1. **Revenue/throughput framing** (Open Q `open-questions.md:54`) — confirm "positioning exercise, not sustainability target" at ~4.8M원/year ceiling. D1 legibility copy tonally shifts if the answer is "sustainability."
2. **19,900원 + 10-cap pricing** (ADR C1+C4, plan:147) — confirm before TN-V2-P5 Gumroad SKU creation. Cap is public via counter.
3. **Route label Korean copy** — confirm `"실전 시나리오"` as the user-facing Korean label for `/scenarios` in nav + hero subtitle, OR pick alternate from Open Q `open-questions.md:52` ("AI 협업 실전 시나리오" / "AI와 함께 푸는 실전 시나리오" / "언러닝 실전 시나리오"). **Blocks TN-V2-P4.**
4. **Scenario repo location** (Open Q `open-questions.md:50`) — standalone `thenocodes/scenario-01-timezone` (Planner rec) vs monorepo subtree vs post-purchase Gist. **Blocks TN-V2-P1.**
5. **P3 decision rule accepted** (Open Q `open-questions.md:45`) — confirm "narrow relaxation + auto-rescind at 10 pre-orders + no other exceptions without rewriting P1" is the operating rule.
6. **Rev4 P5 cutover timing restatement** (Residual A) — ask Planner for a one-line restate in plan or slack: "TN-P5 cutover targets [date/week]; Neon T+14 teardown clock starts at cutover, not plan-approval."

Optional (can decide mid-execution):
- Beta cohort price (free / 9,900원 / 19,900원) — before TN-V2-P6 invite.
- Nav section placement — deferable 4 weeks per FU7.
- Prompt-log template final structure — Planner recommends Goal / Prompts / AI output / Verification attempts / Final diff rationale; confirm before TN-V2-P1 publication.

---

## Ralplan Summary Row (DELIBERATE mode, iter 2)

- **Principle/Option Consistency (G1):** PASS — P3 is now a real decision rule; P1/P2/P4/P5 unchanged and coherent with option set.
- **Alternatives Depth (G2):** PASS — consulting-service steelman explicitly added to ADR Alternatives (plan:350) with falsifiable revenue-ceiling commitment; Scenario-rename alternative documented.
- **Risk/Verification Rigor (G3/G5):** PASS — 4 pre-mortem scenarios with falsifiable triggers; Week-4 gate has 4 numeric thresholds + 3-of-4 branch; inter-rater validity signal added.
- **Deliberate Additions (G6/G7):** PASS — S4 pre-mortem added; expanded test plan now includes dogfood + external-grader + inter-rater + beta + Week-4 gate.

**Overall: APPROVE.**

