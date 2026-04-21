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
