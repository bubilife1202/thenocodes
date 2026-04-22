# Open Questions

## boss-mode-excel-theme — 2026-04-10 (Revision 2)

Resolved in Revision 2:
- ~~Title bar Korean vs English~~ — RESOLVED: English only ("thenocodes.xlsx - Microsoft Excel") per R4 (avoids Calibri/Pretendard mixing).
- ~~"정상 모드" escape link scope~~ — RESOLVED: removed; no escape toggle in v1.
- ~~Calibri/Segoe UI fallbacks~~ — RESOLVED: chrome is English-only, so the Calibri stack works without Korean glyph fallback.
- ~~Delete site-navigation/footer in same PR?~~ — RESOLVED: delete in same PR per R17.
- ~~Visual-verdict 7/10 desktop + 6/10 mobile threshold~~ — RESOLVED: visual-verdict demoted to informational only (R16); deterministic DOM checks are the primary gate.
- ~~DATA tab dynamic per-page filters~~ — RESOLVED: out of scope; follow-up PR.
- ~~Wrapper-level className safety on signal workflow pages~~ — RESOLVED by R3/R15: admin pages mechanically excluded via `(admin)` route group; no wrapper-level className changes at all.

Still open:
- [ ] After Iteration 2 informational visual-verdict score: is chrome recognition strong enough without column-letter strip and row-number gutter? — If weak, reintroduce a desktop-only decorative column-letter strip as a follow-up iteration. Decision deferred to post-iter-2 review.
- [ ] Should the skip link text "본문으로 건너뛰기" remain Korean (current plan) or become English ("Skip to main content") for chrome consistency? — Minor; currently planned as Korean since it's screen-reader-only and aligns with page content language.
- [ ] After initial ship: do we eventually want the `(admin)` layout to adopt a lighter Excel theme (e.g., a "DATA ENTRY" tab visual) while still preserving byte-identity of form logic? — Follow-up consideration, out of scope for this PR.

## thenocodes-integration-v1 — 2026-04-21

- [ ] Nav placement: `/simulator` under a new "제품" section (recommended for scope clarity) or mixed into main nav? — Affects site-navigation.tsx changes in TN-P2.
- [ ] Cutover timing: Is weekend evening KST acceptable for DNS + Neon→Supabase migration? — Affects TN-P5 scheduling and DNS TTL prep.
- [ ] Community post tone: Marketing-style pinned announcement or low-key builder-log entry? — Affects TN-P6 copy.
- [ ] `hello@thenocodes.org` provisioning: Does the inbox exist with SPF/DKIM/DMARC configured? — Blocks legal/privacy page updates in TN-P4.
- [ ] Route naming: `/simulator` final, or Korean variant (`/실무-시뮬레이션`, `/practice`)? Note nav already references `/problem-bank` without a route — confirm routing conventions. — Affects TN-P2 URL and metadata.
- [ ] PIPA re-consent: Rebranding UnlearnFit → 더노코즈 may require informing existing waitlist subscribers of the brand change. Does the collected `marketing_consent` text cover brand rename? — Affects whether a one-time notification email goes out pre-cutover.
- [ ] Gumroad transition: Confirm zero pre-orders exist on old SKU (expected under P1 gate) before new-SKU cutover. — Affects whether D3→D1 flip can be instantaneous or needs manual refund.
- [ ] `unlearnfit.kr` retention horizon: Hold the domain 12 months for 301 redirect, then let it lapse, or keep indefinitely? — Affects domain renewal budget.

## thenocodes-integration-v2-ai-real-problem — 2026-04-21

- [ ] Nav section label: "러닝", "언러닝", "학습", "제품", or "Problems"? — Affects site-navigation.tsx + hero consistency. Planner recommends "러닝" as neutral-Korean; "언러닝" is thesis-aligned but risks reading as marketing-cute.
- [ ] Route name confirmation: `/problems` vs `/real-problems` vs `/진짜문제` (Korean URL) vs `/learn`? — Required before TN-V2-P4. Planner recommends `/problems`.
- [ ] Problem repo location: new standalone GitHub repo (e.g. `thenocodes/problem-01-timezone`), monorepo subtree (`examples/problem-01/`), or private Gist revealed post-purchase? — Planner recommends public standalone repo (visibility = legibility, not giveaway).
- [ ] Beta cohort price: free, 9,900원 (half), or 19,900원 full with "beta = smaller cohort" framing? — Planner recommends half-price with explicit feedback expectation.
- [ ] P1 gate relaxation acceptance: Is the user OK with "content yes, submission-pipeline code no" as a faithful evolution of Rev4's P1 gate? — Structural; Critic will flag.
- [ ] "AI-Assisted Real Problem" Korean primary phrase: "AI 협업 실전 문제" vs "AI와 함께 푸는 실전 문제" vs "언러닝 실전 문제"? — Required before TN-V2-P4 authoring.
- [ ] Recursion guardrail timing: strict P4 (no AI in v2 grading at all — Planner's current stance) vs looser (AI as transparent first-pass reviewer, human always overrides, shown inline)? — Throughput vs S2 risk tradeoff.
- [ ] Re-scope of inherited Rev4 open questions (nav placement, cutover timing, community post tone, `hello@thenocodes.org`, PIPA re-consent, Gumroad transition, unlearnfit.kr retention) now that route is `/problems` and SKU title changes — user should re-read Rev4 list in Rev5 context.

## thenocodes-integration-v2-ai-real-problem — iter 2 (2026-04-22)

Resolved in iter 2:
- ~~Route name~~ — RESOLVED F4: `/scenarios` (avoids collision with existing `/problem-bank`; matches Scenario branding after F3 rename).
- ~~P1 gate relaxation acceptance~~ — RESOLVED F1 Option a: P3 decision rule in §1 (narrow relaxation for pre-order-legibility content only; auto-rescinds at 10 pre-orders). User confirmation still recommended before TN-V2-P1.
- ~~"Real Problem" vs "Scenario" framing~~ — RESOLVED F3 Option a: renamed to "Scenario / 실전 시나리오" across product name, SKU, hero, route, copy. "Real Problem" branding may return in future cohorts if genuinely community-sourced (FU1).

Still open:
- [ ] Nav section label: "러닝" vs "언러닝" vs defer 4 weeks per Architect S-B. Planner recommends **defer 4 weeks**: ship hero-copy-sharp, nav-placement-deferred; decide with Week-4 data.
- [ ] Scenario repo location: standalone GitHub (`thenocodes/scenario-01-timezone`), monorepo subtree (`examples/scenario-01/`), or post-purchase Gist? — Planner recommends public standalone. **Required before TN-V2-P1.**
- [ ] Beta cohort price: free / 9,900원 / 19,900원 with beta framing? — Planner recommends 9,900원 with feedback expectation.
- [ ] Korean brand phrase for "AI-Assisted Scenario": "AI 협업 실전 시나리오" / "AI와 함께 푸는 실전 시나리오" / "언러닝 실전 시나리오"? — **Required before TN-V2-P4.**
- [ ] Recursion guardrail timing: P4 strict (no AI in v2 grading) vs transparent first-pass reviewer with human override shown inline? — Throughput vs S2 risk tradeoff.
- [ ] **Revenue/throughput commitment** (Critic §9): at cap ~4.8M원/year annualized. Is this SKU a positioning/validation exercise or a sustainability target? Planner's framing: **positioning exercise.** User confirms — D1 reads differently otherwise.
- [ ] **"언러닝 시대" copy half-life** (Critic §9): 12-24mo half-life on similar tech positioning. Copy-rollback plan if term ages poorly? Advisory; copy is reversible.
- [ ] **Prompt-log markdown template** (Critic §9): Claude Code / Cursor / ChatGPT produce different log shapes. TN-V2-P1 specifies a single markdown template with required headings (Goal / Prompts / AI output / Verification attempts / Final diff rationale). User confirms template structure.
- [ ] **Consulting-vs-product signal** (Critic §9): Week-2 reviewer says "this looks like paid office hours with a rubric." Pass or fail signal? Planner stance: **pass if reviewer also articulates rubric+repeatability differentiator; fail if rubric is seen as conversational artifact only.** User confirms before Week-2 review.
- [ ] Inherited Rev4 open questions still pending: `hello@thenocodes.org` SPF/DKIM/DMARC provisioning, PIPA re-consent, Gumroad old-SKU zero-preorder confirmation, unlearnfit.kr retention horizon.
