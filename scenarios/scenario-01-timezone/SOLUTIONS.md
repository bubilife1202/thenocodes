<!-- private: do not ship to learners -->

# Solutions — Scenario #1

## Bug A — Visible (test 3 fails)

**Root cause:** The weekday label is derived from `utcDate.getUTCDay()` without
accounting for the +9-hour Seoul offset. When a UTC datetime falls on a
Tuesday evening (15:00–23:59), Seoul is already Wednesday. The function
returns the UTC weekday label (`화`) instead of the Seoul weekday label (`수`).

**Repro:**
- Input: `"2026-04-28T16:30:00Z"` (UTC Tuesday 2026-04-28)
- Seoul local: `2026-04-29 01:30 KST` (Wednesday)
- Buggy output: `"2026-04-29 (화) 01:30 KST"`
- Expected: `"2026-04-29 (수) 01:30 KST"`

**Minimal fix:** Derive the weekday from `advancedDate` (the date that has
already had `dayOverflow` applied), not from the original `utcDate`.

```ts
// Before (Bug A)
const weekday = DAYS_KO[utcDate.getUTCDay()];

// After (fixed)
const weekday = DAYS_KO[advancedDate.getUTCDay()];
```

**AI verification behaviors that would catch this:**
- (a) Read the weekday-derivation line and notice it references `utcDate` while all other date fields use `advancedDate`.
- (b) Add a test that asserts the weekday for any UTC time where UTC-day ≠ Seoul-day.
- (c) Step through the computation manually for the failing test case.

---

## Bug B — Hidden (no test triggers it)

**Root cause:** The date-advance condition uses `> 24` (strict greater-than)
instead of `>= 24`. When `rawHour === 24` exactly — i.e., UTC hour 15 → Seoul
00:xx — the condition is false and the date is NOT advanced. Seoul midnight is
rendered with the previous day's date AND the previous day's weekday.

**Repro:**
- Input: `"2026-03-21T15:15:00Z"` (UTC Saturday 2026-03-21, 15:15)
- `rawHour` = 15 + 9 = 24; `24 > 24` → false; `dayOverflow` = 0
- `advancedDate` stays `2026-03-21`; `localHour` = `24 % 24` = 0
- Weekday from `utcDate.getUTCDay()` = Saturday (`토`)
- Buggy output: `"2026-03-21 (토) 00:15 KST"`
- Expected: `"2026-03-22 (일) 00:15 KST"`

**Minimal fix:** Change `> 24` to `>= 24`.

```ts
// Before (Bug B)
const dayOverflow = rawHour > 24 ? 1 : 0;

// After (fixed — also apply Bug A fix for weekday)
const dayOverflow = rawHour >= 24 ? 1 : 0;
```

**AI verification behaviors that would catch this:**
- (a) Brute-force test all UTC hours 0–23 for a fixed date and assert the Seoul day/hour.
- (b) Notice the off-by-one feeling of `> 24` vs `>= 24` and ask "what happens when rawHour is exactly 24?"
- (c) Prompt AI: "Are all boundary conditions handled? Walk me through what happens at Seoul local time 00:00."
- (d) Add an explicit regression test for Seoul midnight: `"2026-03-21T15:15:00Z"` → `"2026-03-22 (일) 00:15 KST"`.

---

## How these bugs map to the rubric

| Rubric axis | L3+ anchor behavior |
|---|---|
| **Collaboration** | Learner decomposed "fix the failing test" and "check for hidden regressions" as two separate prompting sub-tasks, rather than one god-prompt. |
| **Verification (L4 anchor)** | Learner caught Bug B pre-submission using an independent signal — e.g. brute-force test matrix across UTC hours, second-model cross-check, or manual trace at `rawHour === 24`. |
| **Improvement (L3+)** | Final diff addresses BOTH bugs AND adds a regression test for Bug B's midnight case — not just a minimal patch for the visible failure. |
