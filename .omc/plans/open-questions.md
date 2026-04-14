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
