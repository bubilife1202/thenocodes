# Plan: Boss-Mode Excel Theme for thenocodes.org

Status: REVISION 2 (post Architect SOUND_WITH_REVISIONS + Critic ITERATE)
Mode: SHORT consensus (visual-only refactor; no DB/API/auth/migrations; `--deliberate` NOT required)
Owner: planner -> architect -> critic -> executor (ralph loop)
Target branch: `main`
Scope: route-group-scoped theme replacement. No new URL paths. No schema or API changes.

Revision notes: this iteration adopts all 20 unified revisions from Architect+Critic consensus. Key structural change: theme is now scoped to an `(excel)` route group via a nested layout; admin/workflow pages move to an `(admin)` route group and are mechanically excluded from the theme. Ribbon is honest primary navigation (no semantic fakes). Chrome text is English-only to avoid mixed typefaces. Iteration 0 baseline is added. Visual-verdict is demoted to secondary; deterministic DOM checks are the primary gate.

---

## RALPLAN-DR Header

### Principles (5)
1. **"At a glance the chrome reads as a spreadsheet workbook; the content area stays fully readable."** No 2m overclaim; no misaligned column-letter illusion. The chrome must be instantly recognizable as Excel; the content must never be harder to read than it is today. (R11)
2. **Decorative chrome is decorative; navigational chrome is real nav — no semantic fakes.** Fake ribbon tabs (FILE/INSERT/FORMULAS/REVIEW) are pure CSS `::before`/`::after` pseudo-elements with zero a11y presence. Real navigation uses real `<nav>` + real `<Link>`. No `role="tablist"` with `aria-disabled` pretend-tabs. (R1)
3. **No routing, data, or API-contract changes.** Every existing URL path keeps its current resolution, data fetch, `revalidate`, `metadata`, and component tree shape. Only presentation changes. Route-group folder moves are file-system rearrangement only; URLs are unchanged. (R3, R6)
4. **Mobile is verified every iteration, not at the end.** 375x812 screenshots and `scrollWidth <= 375` asserts run in every iteration acceptance — not just iteration 5. (R8)
5. **Token-first, Tailwind v4 native.** All colors/spacing/typography go through `@theme` in `globals.css`. No `tailwind.config.*` file (project is config-less v4). `.xl-chrome` is applied per-component, never on `<body>` or `<html>`. (R10)

### Decision Drivers (top 3)
1. **Readability must not regress.** Signal `action_point`, event `D-day` chips, challenge `whyTry` boxes must all remain legible.
2. **Mobile viewport (375px) survival.** Chrome vertical footprint must stay <=200px at `<sm` (R8). No horizontal page scroll on any in-scope page.
3. **Untouchable admin surfaces.** `/signals/new`, `/signals/pending`, `/signals/pending/[id]`, `/api/slack/**`, and the `pending_signals` flow are off-limits. Mechanically excluded via route group (R3) — not via wrapper gymnastics.

### Viable Options

#### Option A — Full Immersive Ribbon + Grid Wrapper (rejected)
Everything wrapped in an Excel window: title bar, ribbon, formula bar, column letters (A-Z), row numbers (1-n), sheet tabs, status bar. Content cards become cells aligned to a 12-col grid with visible 1px gridlines.
- Pros: highest illusion score; single unified theme.
- Cons: heaviest mobile penalty; forces card rewrites to fit fixed cell dimensions; threatens admin UIs (though admin is now excluded by route group, A's content-alignment rule still threatens all `(excel)` pages).
- **Invalidation rationale:** "align cards to gridline-accurate cells" would force rewrites of `signal-card`, `event-card`, `challenge-card` to match fixed column widths, regressing content legibility for the sake of chrome authenticity. Fails Driver #1.

#### Option B — Lightweight Excel-Flat Theme (rejected)
Mono/Calibri-ish font, flat neutral grays, 1px borders on cards, sheet tabs at bottom as the ONLY Excel chrome. No ribbon, no formula bar, no column letters.
- Pros: cheapest; zero mobile regression risk; content readability guaranteed.
- Cons: no ribbon, no formula bar.
- **Invalidation rationale:** Sheet tabs alone read as "generic browser tabs" not Excel. Without ribbon + formula bar (Excel's two most recognizable chrome elements), the result reads as "a site with a green header" rather than "Excel". Fails the core boss-mode recognition test.

#### Option C — Hybrid: Full Excel Chrome, Semi-Normal Cell Content (CHOSEN)
Full chrome (title bar + ribbon + formula bar + sheet tabs + status bar) wrapping `(excel)`-group pages. Ribbon IS the primary navigation. Cells contain existing card components lightly restyled (square corners, flat bg, 1px borders, color coding preserved via left border rail). Column letters / row numbers are hidden entirely on mobile and are decorative-only on desktop.
- **Pros:** maximal Excel recognition (ribbon + formula bar + sheet tabs + status bar all present), content legibility preserved, mobile has deterministic collapse strategy, admin pages mechanically excluded via route group. Real nav uses real HTML.
- **Cons:** more files touched than B; chrome-vs-content visual tension needs careful token tuning; chrome copy is English-only to avoid Calibri-vs-Pretendard typeface mix.
- **Chrome:content vertical ratio at 375px:** ~24/76 worst case (180px chrome / 632px content at 812px viewport).

#### Option D — Pure token swap, zero new components (rejected)
Swap `globals.css` to Excel palette (green #217346, white cells, Calibri stack for chrome font), drop corner radii to 2px, flatten gradients, add 1px borders to cards. Reuse ALL existing components unchanged. Sidebar nav restyled as a "Sheet list" gutter. Zero new files.
- **Real pros:** lowest risk, mobile-free (existing responsive layout already survives), signal workflow mechanically untouched, fastest to ship, honest (no misaligned overlays), no new a11y surface.
- **Real cons:** no ribbon, no formula bar. Those are the two chrome elements that make a screenshot instantly read as Excel vs. "spreadsheet-themed site".
- **Invalidation rationale (non-circular):** D cannot deliver the ribbon or formula bar — the two chrome elements that make the screenshot instantly read as Excel vs. "a site with a green header". The boss-mode goal depends on those elements being present, which is a **product requirement** from the user, not a tautology of the chosen approach. If the user later decides "green-header-only" is acceptable, Option D is the correct fallback and should be revived; this revision keeps D documented as the explicit cheap fallback. (R2)

### Chosen Option: **C (Hybrid, route-group scoped, ribbon as real nav)**

### Deliberate mode needed?
**No.** Visual-only, no auth, no migrations, no destructive ops, no API changes, no PII, no public API breakage. Existing data flows untouched. Short mode is correct.

---

## Next 16 Framework Compliance

Cited from `node_modules/next/dist/docs/01-app/**` (verified in this repo's installed Next 16):

1. **Root layout must define `<html>` and `<body>`** and should not include `<title>`/`<meta>` tags manually — use the Metadata API (`export const metadata`).
   - Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` lines 140-141.
2. **Multiple root layouts via route groups** (`app/(shop)/layout.js`, `app/(marketing)/layout.js`) trigger a **full page load** when navigating between groups. Only applies when there is no top-level `app/layout.js`.
   - Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` lines 142-145.
   - **Implication for this plan:** we KEEP the top-level `src/app/layout.tsx` as the single root layout (defining `<html>`, `<body>`, Pretendard `<link>`, `metadata`). Nested layouts inside `(excel)/` and `(admin)/` are **non-root** layouts. Navigating between groups stays client-side, no full reload penalty.
3. **Route groups**: wrap a folder's name in parens `(folderName)`. The folder is NOT included in the URL. Use case: "Opting specific route segments into sharing a layout, while keeping others out." Conflicting paths across groups cause an error (e.g. two `(a)/about/page.js` + `(b)/about/page.js`).
   - Source: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` lines 6-32.
   - **Implication:** moving `src/app/hackathons/` to `src/app/(excel)/hackathons/` leaves the URL as `/hackathons`. No 301/308. No path conflicts because every route moves to exactly one of `(excel)` or `(admin)`.
4. **`usePathname` is a Client Component hook.** Server components cannot read the current URL. Components using `usePathname` must be `"use client"`.
   - Source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` lines 6-38.
   - **Implication:** `ribbon.tsx` and `sheet-tabs.tsx` are client components. `title-bar.tsx`, `formula-bar.tsx`, `status-bar.tsx` stay server components (they don't need the pathname, or they receive it via a prop from a client wrapper). `formula-bar.tsx` is downgraded to a client component only if it needs pathname; otherwise it receives the current pathname from the parent client ribbon via composition. Plan: make `formula-bar.tsx` a small client component since it's tiny and cheap.
5. **`metadata` export rules**: set `metadata` in the root layout and/or individual pages. Page-level `export const metadata` and `export const revalidate` are byte-sensitive — executor must preserve them exactly on any file moved into a route group.
6. **`opengraph-image` / `icon` conventions**: no such files exist currently under `src/app/` (verified via Glob). The root `layout.tsx` `openGraph` metadata field is the only OG surface. It MUST remain untouched. (R14)

---

## Goal & Non-Goals

### Goal
Replace the visual theme of the `(excel)` route group so visitors at a glance appear to be working in Microsoft Excel ("boss mode"), while all existing content remains fully functional, readable, and accessible. Admin/workflow pages move to an `(admin)` route group and are completely excluded from the theme.

### Non-Goals (explicit out-of-scope)
- No changes to database schema, Supabase tables, or any migrations.
- No changes to `/api/slack/**` handlers, Slack interactivity payload contract, or Cloudflare Workers secrets.
- No changes to the signal approval workflow: `pending_signals` lifecycle, `builder_signals` insert path, `scripts/add-signal.ts`, `/signals/new` editor logic, `/signals/pending` review logic.
- No new URL routes. No `/sheet` path. No theme toggle in the database layer.
- No changes to data fetching functions in `src/lib/data/**`.
- No changes to authentication or any session handling.
- No changes to `metadata.openGraph` / OG image behavior (R14).
- No `next/font` package install unless absolutely needed — prefer CDN or system stack.

---

## Route Group Restructure (R3)

### Before
```
src/app/
  layout.tsx                   (root layout, <html>, <body>, SiteNavigation sidebar)
  page.tsx                     (/)
  hackathons/page.tsx          (/hackathons)
  contests/page.tsx            (/contests)
  meetups/page.tsx             (/meetups)
  challenges/page.tsx          (/challenges)
  signals/page.tsx             (/signals)
  signals/new/page.tsx         (/signals/new)
  signals/new/login-form.tsx
  signals/new/signal-editor.tsx
  signals/pending/page.tsx     (/signals/pending)
  signals/pending/[id]/page.tsx
  feedback/page.tsx            (/feedback)
  api/**                       (unchanged)
  globals.css
```

### After
```
src/app/
  layout.tsx                   (root layout: <html>, <body>, <link rel=pretendard>, metadata). Thin shell. Renders {children}.
  globals.css                  (updated with Excel tokens + Pretendard vars)
  api/**                       (UNCHANGED)

  (excel)/
    layout.tsx                 (Excel-themed nested layout: TitleBar -> Ribbon -> FormulaBar -> main -> SheetTabs -> StatusBar)
    page.tsx                   (/) — moved from src/app/page.tsx
    hackathons/page.tsx        (/hackathons)
    contests/page.tsx          (/contests)
    meetups/page.tsx           (/meetups)
    challenges/page.tsx        (/challenges)
    signals/page.tsx           (/signals) — public list only, NOT /signals/new or /signals/pending
    feedback/page.tsx          (/feedback)

  (admin)/
    layout.tsx                 (minimal neutral nested layout: just a bare wrapper; keeps current visual style)
    signals/
      new/page.tsx             (/signals/new) — byte-identical to current
      new/login-form.tsx
      new/signal-editor.tsx
      pending/page.tsx         (/signals/pending) — byte-identical
      pending/[id]/page.tsx    — byte-identical
```

### URL impact audit
- `/` remains `/` — served from `(excel)/page.tsx` instead of `page.tsx`.
- `/hackathons`, `/contests`, `/meetups`, `/challenges`, `/signals`, `/feedback` — all unchanged URLs.
- `/signals/new`, `/signals/pending`, `/signals/pending/[id]` — unchanged URLs.
- **Critical path-conflict check**: `/signals` lives in `(excel)/signals/page.tsx`; `/signals/new` lives in `(admin)/signals/new/page.tsx`. Different URL segments under different groups is FINE per Next 16 (conflicts only arise when two groups resolve to the same final URL). The executor must confirm `next build` succeeds after the move as the authoritative conflict check.
- `api/**` stays at `src/app/api/**` (no group).

### Byte-identity contract for moved admin pages (R5, R6)
```bash
# Verification: admin pages that moved must be byte-identical
diff <(git show main:src/app/signals/new/page.tsx)         src/app/(admin)/signals/new/page.tsx
diff <(git show main:src/app/signals/new/login-form.tsx)   src/app/(admin)/signals/new/login-form.tsx
diff <(git show main:src/app/signals/new/signal-editor.tsx) src/app/(admin)/signals/new/signal-editor.tsx
diff <(git show main:src/app/signals/pending/page.tsx)     src/app/(admin)/signals/pending/page.tsx
diff <(git show main:src/app/signals/pending/[id]/page.tsx) src/app/(admin)/signals/pending/[id]/page.tsx
# All five diffs MUST be empty. Criterion enforced in iteration 1 acceptance.
```

Note: the import path `@/app/signals/new/login-form` inside `(admin)/signals/pending/page.tsx` must be updated to `@/app/(admin)/signals/new/login-form` — this is the ONE permitted diff in the admin move (an import path correction, not a logic change). Alternatively, keep a re-export shim at the old import path. Executor picks whichever produces the smaller diff. **Document the exception:** import-path updates due to the move are the ONLY permitted diffs in `(admin)/**`.

### Page exports contract snapshot (R6)
Executor runs in Iteration 0 (baseline):
```bash
grep -rn "^export const \(revalidate\|metadata\|dynamic\|runtime\|fetchCache\|preferredRegion\)" src/app > .omc/research/baseline/exports.txt
```
And after each move:
```bash
grep -rn "^export const \(revalidate\|metadata\|dynamic\|runtime\|fetchCache\|preferredRegion\)" src/app > .omc/research/post-move/exports.txt
diff .omc/research/baseline/exports.txt .omc/research/post-move/exports.txt
# Expected diff: only the file-path column changes (old path -> new group-prefixed path). The export declarations themselves must be character-identical.
```

---

## Target Excel Anatomy -> Site Element Mapping

| Excel element | Site element | Component | Notes |
|---|---|---|---|
| Title bar (window chrome, app icon, doc name, min/max/close) | Thin strip atop `(excel)` layout | `src/components/excel/title-bar.tsx` (NEW, server) | Visual text: **"thenocodes.xlsx - Microsoft Excel"** (English, decorative, `aria-hidden`). 3 window buttons are decorative svg only. (R4) |
| Quick Access Toolbar (save, undo, redo icons) | Small icon strip left of title | Same file | Decorative. |
| Ribbon tab strip | **Primary navigation** | `src/components/excel/ribbon.tsx` (NEW, client) | `<nav aria-label="Primary">` containing 7 real `<Link>` elements: HOME / HACKATHONS / CONTESTS / MEETUPS / CHALLENGES / SIGNALS / FEEDBACK. Active link has `aria-current="page"`. No `role="tablist"`, no `aria-disabled`. Fake tab labels (FILE/INSERT/FORMULAS/DATA/REVIEW/VIEW) are pure CSS `::before`/`::after` decorative pseudo-elements on the nav wrapper with `aria-hidden` parent wrapper for the pseudo row. (R1, R4) |
| Name box (cell reference, left of formula bar) | Decorative label | `src/components/excel/formula-bar.tsx` (NEW, client) | Shows "A1"/"B2"/etc, derived from pathname via `src/lib/excel/route-to-cell.ts`. Decorative, `aria-hidden`. |
| Formula bar (fx + current cell content) | Decorative breadcrumb | Same file | `fx` icon + the current page H1 text mirrored visually. Marked `aria-hidden` — the real H1 is still present inside `<main>`. |
| Column headers A, B, C, D... | **REMOVED** | — | No longer present. Column letters created overlay-vs-content misalignment risk and violated Principle #1 (honest chrome). The decorative overlay idea is abandoned. |
| Row numbers 1, 2, 3... | **REMOVED** | — | Same reason. |
| Cells (individual content squares) | Content cards | Existing cards, lightly restyled | Signal/Event/Challenge cards keep their anatomy; square corners + 1px border + flat bg. Color coding preserved via left border rail. |
| Sheet tabs (bottom) | Secondary section switcher | `src/components/excel/sheet-tabs.tsx` (NEW, client) | 7 tabs: Home / Hackathons / Contests / Meetups / Challenges / Signals / Feedback (English, R4). Real `<nav aria-label="Sheets">` + real `<Link>` elements. Active tab has `aria-current="page"`. Horizontal scroll on mobile. Redundant with ribbon links but intentional — it's a secondary visual Excel anchor. (R19) |
| Status bar | Decorative footer | `src/components/excel/status-bar.tsx` (NEW, server) | **Static text only**: "Ready" on left, "100%" on right. No data fetch, no counts, no stats. Fully decorative, `aria-hidden`. (R9) |

**Note:** Column letter strip and row number gutter are removed from the plan entirely. They were the primary source of the "misaligned illusion" critique and added mobile burden with no honest value. Reconsider only if visual-verdict falls below threshold after iteration 4.

---

## Design System Spec (tokens)

### Color palette (Excel 2016+ light theme approximation)
Add to `src/app/globals.css` inside `@theme { ... }`:

```
/* Excel chrome */
--color-xl-title-bg:       #217346;  /* Excel green title bar */
--color-xl-title-fg:       #FFFFFF;
--color-xl-ribbon-bg:      #F3F2F1;
--color-xl-ribbon-tab-active-bg: #FFFFFF;
--color-xl-ribbon-tab-fg:  #444444;
--color-xl-ribbon-border:  #E1DFDD;
--color-xl-ribbon-divider: #D0CFCD;
--color-xl-formula-bg:     #FFFFFF;
--color-xl-formula-border: #D0CFCD;
--color-xl-namebox-bg:     #FFFFFF;
--color-xl-namebox-fg:     #444444;

/* Cell area */
--color-xl-gridline:       #D4D4D4;
--color-xl-cell-bg:        #FFFFFF;
--color-xl-cell-fg:        #18181B;
--color-xl-cell-selected-border: #217346;

/* Sheet tabs + status bar */
--color-xl-sheet-bar-bg:   #F3F2F1;
--color-xl-sheet-tab-bg:   #F3F2F1;
--color-xl-sheet-tab-active-bg: #FFFFFF;
--color-xl-sheet-tab-active-fg: #217346;
--color-xl-sheet-tab-border: #D0CFCD;
--color-xl-status-bar-bg:  #217346;
--color-xl-status-bar-fg:  #FFFFFF;

/* Accent */
--color-xl-green:          #217346;
--color-xl-green-hover:    #185A36;
--color-xl-accent-blue:    #0078D4;
```

Body background stays `#FCFBF8` at the root level. The `(excel)` layout overrides its own wrapper to `#FFFFFF` (cell white). The `(admin)` layout keeps the warm brand bg — this preserves admin visual identity.

### Typography
- **Chrome (title bar, ribbon, formula bar, sheet tabs, status bar)**: `"Calibri", "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif`. All chrome text is **English only** (R4), so no Korean glyph fallback is needed — Calibri stack works cleanly across platforms.
- **Content (cells = card bodies)**: current Pretendard Variable via CDN, unchanged. Korean content stays in Pretendard for readability.
- **Font-family isolation** (R10): `.xl-chrome { font-family: var(--font-xl-chrome); }` applied directly on each chrome component (TitleBar, Ribbon, FormulaBar, SheetTabs, StatusBar) — **NEVER on `<body>` or `<html>`**. No global `main, article { font-family: ... }` reset — unnecessary since the chrome class is per-component.
- `--font-xl-chrome: "Calibri", "Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif;` defined in `@theme`.
- Font sizes: title bar 12px; ribbon tabs 12px uppercase tracking-wide; name box 13px; formula bar 13px; sheet tabs 12px; status bar 11px; cell content unchanged.

### Spacing & layout
- Title bar height: 28px (desktop) / 24px (`<sm`)
- Ribbon strip (one row): 48px desktop / 40px `<sm`
- Formula bar: 24px
- Sheet tabs: 28px
- Status bar: 22px
- **Total chrome vertical footprint at `<sm`**: 24 + 40 + 24 + 28 + 22 = **138px** (well under the 200px R8 budget)
- **Total chrome vertical footprint at desktop**: 28 + 48 + 24 + 28 + 22 = 150px
- Content padding inside cell area: 12px `<sm` / 16px `sm-md` / 24px `md+`
- Border radius: chrome = 0 (square). Cards = `rounded-[2px]`.

### Component specs (summary)
- `TitleBar` (server): `h-7 bg-[var(--color-xl-title-bg)] text-[var(--color-xl-title-fg)] xl-chrome text-[12px] flex items-center px-2`. `aria-hidden="true"`. Shows Office-like icon SVG, "thenocodes.xlsx - Microsoft Excel", right-side min/max/close SVGs. All decorative.
- `Ribbon` (client, uses `usePathname`): sticky top below title bar. Decorative fake-tab row (CSS pseudo-elements, wrapper `aria-hidden`) visually labeled FILE / HOME / INSERT / FORMULAS / DATA / REVIEW / VIEW. Below that, the real `<nav aria-label="Primary">` with 7 `<Link>` elements using English labels (HOME / HACKATHONS / CONTESTS / MEETUPS / CHALLENGES / SIGNALS / FEEDBACK). Active link gets `aria-current="page"` and visual underline.
- `FormulaBar` (client, uses `usePathname`): `h-6`, `aria-hidden="true"`. Layout: `[Name Box | fx | decorative-breadcrumb]`. Decorative only.
- `SheetTabs` (client, uses `usePathname`): sticky bottom, above status bar. Real `<nav aria-label="Sheets">` wrapping 7 `<Link>`s, English labels. Horizontal scroll on mobile. Active tab: white fill + green underline + `aria-current="page"`.
- `StatusBar` (server): `aria-hidden="true"`. Static text "Ready" left, "100%" right. No stats, no counts, no data fetch. (R9)

---

## Component Inventory & File-Level Changes

### NEW files (in this PR)
1. `src/app/(excel)/layout.tsx` — nested layout for themed routes (server component; renders the 5 client/server chrome components around `{children}`). Exports no `metadata` (inherits from root). Sets the page background to `#FFFFFF` via a wrapper div.
2. `src/app/(admin)/layout.tsx` — nested layout for admin routes (server component; minimal pass-through wrapper. Keeps current `#FCFBF8` bg; no chrome). Exports no `metadata` (inherits from root).
3. `src/components/excel/title-bar.tsx` — server component.
4. `src/components/excel/ribbon.tsx` — client component (`"use client"`, `usePathname`).
5. `src/components/excel/formula-bar.tsx` — client component (`"use client"`, `usePathname`).
6. `src/components/excel/sheet-tabs.tsx` — client component (`"use client"`, `usePathname`).
7. `src/components/excel/status-bar.tsx` — server component.
8. `src/components/excel/ribbon-tabs.ts` — pure module exporting the nav link definitions: `[{href, labelEn, pathnameMatch}]`.
9. `src/lib/excel/route-to-cell.ts` — pure util: pathname -> `{nameBoxRef, sheetLabel}`.

### MOVED files (path changes only; content byte-identical except noted)
Each `git mv` move is paired with an import-path-only fix if required (R5, R6).
1. `src/app/page.tsx` -> `src/app/(excel)/page.tsx`
2. `src/app/hackathons/page.tsx` -> `src/app/(excel)/hackathons/page.tsx`
3. `src/app/contests/page.tsx` -> `src/app/(excel)/contests/page.tsx`
4. `src/app/meetups/page.tsx` -> `src/app/(excel)/meetups/page.tsx`
5. `src/app/challenges/page.tsx` -> `src/app/(excel)/challenges/page.tsx`
6. `src/app/signals/page.tsx` -> `src/app/(excel)/signals/page.tsx`
7. `src/app/feedback/page.tsx` -> `src/app/(excel)/feedback/page.tsx`
8. `src/app/signals/new/page.tsx` -> `src/app/(admin)/signals/new/page.tsx` (byte-identical)
9. `src/app/signals/new/login-form.tsx` -> `src/app/(admin)/signals/new/login-form.tsx` (byte-identical)
10. `src/app/signals/new/signal-editor.tsx` -> `src/app/(admin)/signals/new/signal-editor.tsx` (byte-identical)
11. `src/app/signals/pending/page.tsx` -> `src/app/(admin)/signals/pending/page.tsx` (ONE permitted diff: update `import { LoginForm } from "@/app/signals/new/login-form"` to new path)
12. `src/app/signals/pending/[id]/page.tsx` -> `src/app/(admin)/signals/pending/[id]/page.tsx` (byte-identical unless it imports from the new/* tree)

Move operations use `git mv` to preserve git history.

### MODIFIED files
1. `src/app/globals.css` — add `@theme` Excel tokens + `.xl-chrome` utility + `--font-xl-chrome`. KEEP Pretendard definition for cells. **No** `main, article` font reset (R10).
2. `src/app/layout.tsx` (root, thin shell):
   - Remove `SiteNavigation` and `Footer` imports.
   - Remove the `lg:grid lg:grid-cols-[288px_minmax(0,1fr)]` sidebar wrapper.
   - Body becomes just `<body className="font-pretendard bg-[#FCFBF8] text-[#18181B] antialiased">{children}</body>`.
   - `metadata` export stays byte-identical — particularly `openGraph` (R14). Do not add, remove, or reorder keys.
3. `src/app/(excel)/page.tsx` (the moved homepage):
   - Remove the giant hero `<section>` with `rounded-[32px]` outer frame (redundant once `(excel)` layout provides chrome).
   - Replace outer `rounded-[28/32px]` wrappers with `border border-[var(--color-xl-gridline)] bg-white` cell-style wrappers.
   - Replace gradients with flat fills.
4. `src/app/(excel)/hackathons/page.tsx`, `contests/page.tsx`, `meetups/page.tsx`, `challenges/page.tsx`, `signals/page.tsx`, `feedback/page.tsx` — wrap main content in `border border-[var(--color-xl-gridline)] bg-white p-4`. Recolor active filter tab to `bg-[var(--color-xl-green)] text-white`.
5. `src/components/signal-card.tsx`:
   - `rounded-[28px]` -> `rounded-[2px]`
   - Gradient shell bg -> flat `bg-white` + left colored 3px `border-l-[3px]` (color from existing `styles.bar`).
   - Drop heavy shadow; add `border border-[var(--color-xl-gridline)]`.
   - KEEP: title, summary line-clamp, action_point box, tags, source button, all typography, all aria.
6. `src/components/event-card.tsx` — same treatment: square corners, flat bg, drop shadow, left accent rail preserved. D-day chips unchanged (urgency signal preserved).
7. `src/components/challenge-card.tsx` — same treatment.

### DELETED files (R17)
1. `src/components/layout/site-navigation.tsx` — deleted. No longer referenced after root layout rewrite.
2. `src/components/layout/footer.tsx` — deleted.

**Verification criterion (R17):**
```bash
grep -rn "SiteNavigation\|from.*layout/footer\|from.*layout/site-navigation" src
# Expected: zero matches
```
Both files are deleted in the same PR. This avoids the "deprecated file rotting on disk" anti-pattern.

### UNTOUCHED files (do not modify, do not move)
- `src/lib/data/**`
- `src/lib/signals/**`
- `src/lib/hackathons.ts`
- `src/app/api/**`
- `scripts/**`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `supabase/**`
- `package.json` (no new deps expected)

---

## Mobile Strategy

Deterministic per-iteration mobile verification (R8).

| Element | `<sm` (<=639px) | `sm-md` | `md+` |
|---|---|---|---|
| Title bar | 24px, icon only (no filename text) | 28px | 28px |
| Ribbon | single row, horizontal scroll, 40px | 44px | 48px |
| Formula bar | 24px, content truncated | 24px | 24px |
| Sheet tabs | horizontal scroll strip, 28px | 28px | 28px |
| Status bar | 22px, truncated | 22px | 22px |
| Content side padding | 12px | 16px | 24px |

Chrome total `<sm`: 24 + 40 + 24 + 28 + 22 = **138px**. At 812px iPhone viewport, content = 674px (83%).

- No horizontal page scroll. Enforced via `overflow-x-hidden` on the `(excel)` layout wrapper + horizontal-scroll `overflow-x-auto` on ribbon tab strip and sheet tabs only.
- Content cards stay single-column at `<md`.
- Touch targets: ribbon links and sheet tabs must be >=44px tall on mobile (CSS padding adds invisible tap area beyond the visible height).

**Per-iteration mobile checks (R8, runs EVERY iteration from 1 onward):**
```bash
# Playwright or puppeteer-style check
for path in / /hackathons /contests /meetups /challenges /signals /feedback; do
  # Capture screenshot at 375x812
  # Assert document.documentElement.scrollWidth <= 375
  # Assert chrome vertical footprint (sum of .xl-chrome elements' boundingClientRect.height) <= 200
done
# Also: same checks against /signals/new and /signals/pending — expected UNCHANGED from baseline
```

---

## Accessibility Strategy

1. `TitleBar`: `aria-hidden="true"`. Decorative window buttons `role="presentation" tabindex="-1"`.
2. `Ribbon`:
   - Outer wrapper: `<nav aria-label="Primary">`
   - Decorative fake-tab strip (FILE/INSERT/FORMULAS/...): its own `<div aria-hidden="true">` wrapper, content rendered purely via CSS `::before`/`::after` pseudo-elements. Zero DOM text nodes for fake tabs. Zero `role`, zero `aria-disabled`, zero `tabindex`. (R1)
   - Real nav strip: `<ul>` of 7 `<Link>`s with visible text (HOME / HACKATHONS / CONTESTS / MEETUPS / CHALLENGES / SIGNALS / FEEDBACK). Active link has `aria-current="page"`.
3. `FormulaBar`: entire bar `aria-hidden="true"`. Decorative only.
4. `SheetTabs`:
   - `<nav aria-label="Sheets">` wrapping `<ul>` of 7 `<Link>`s (English labels). Active link has `aria-current="page"`.
   - Ribbon HOME + SheetTabs HOME both target `/`. Intentional. (R19) Two nav landmarks with distinct aria-labels ("Primary" vs "Sheets") let screen reader users distinguish them. `aria-current="page"` disambiguates which is active on the current route.
5. `StatusBar`: `aria-hidden="true"`. Static "Ready"/"100%" text is not announced.
6. DOM order inside `(excel)/layout.tsx`:
   ```
   <div className="xl-root overflow-x-hidden">
     <TitleBar />                                 {/* aria-hidden */}
     <Ribbon />                                   {/* real nav + decorative fake row */}
     <FormulaBar />                               {/* aria-hidden */}
     <main id="main-content" className="xl-cell-area">{children}</main>
     <SheetTabs />                                {/* real nav */}
     <StatusBar />                                {/* aria-hidden */}
   </div>
   ```
7. Skip link: first focusable element in `(excel)/layout.tsx` is a visually hidden `<a href="#main-content">본문으로 건너뛰기</a>` — this is the one piece of Korean chrome text, allowed because it's screen-reader-only and already matches Pretendard.
8. Keyboard sweep test: Tab through `/`, `/hackathons`, `/signals`. All interactive elements reachable. Focus ring visible (Excel green `focus-visible:ring-2 focus-visible:ring-[var(--color-xl-green)]`).

---

## Deterministic DOM Check Suite (Primary Gate, R16)

Replaces visual-verdict as the hard merge gate. Visual-verdict is now informational only.

These assertions run via Playwright or node-based DOM query in every iteration's acceptance step. All must pass:

**Global (every `(excel)` page):**
1. `document.querySelector('[data-xl="title-bar"]')` exists.
2. Title bar computed `background-color` === `rgb(33, 115, 70)` (Excel green #217346).
3. `document.querySelector('nav[aria-label="Primary"]')` exists and contains exactly 7 `<a>` children whose `href` attributes set-equal `{"/", "/hackathons", "/contests", "/meetups", "/challenges", "/signals", "/feedback"}`.
4. `document.querySelector('[data-xl="formula-bar"]')` exists and contains text content matching `/fx/`.
5. `document.querySelector('nav[aria-label="Sheets"]')` exists and contains exactly 7 `<a>` children with the same href set as (3).
6. `document.querySelector('[data-xl="status-bar"]')` exists; text content includes "Ready" and "100%".
7. `document.documentElement.scrollWidth <= window.innerWidth` at both 1440 and 375 widths.
8. Sum of heights of `[data-xl]` elements at 375 width is <=200.

**Admin pages (`/signals/new`, `/signals/pending`):**
9. `document.querySelector('[data-xl="title-bar"]')` is `null`.
10. `document.querySelector('nav[aria-label="Primary"]')` is `null`.
11. Page screenshot pixel-diff vs Iteration 0 baseline is <1% (R13).

**Accessibility static checks:**
12. `document.querySelectorAll('[role="tablist"]').length === 0` (no fake tablist, R1).
13. `document.querySelectorAll('[aria-disabled="true"]').length === 0` on `(excel)` pages (no pretend-disabled tabs, R1).
14. Exactly one `<main>` element per page.

**Visual-verdict** (R16, secondary, informational):
- Run 1x per iteration on `/` desktop + `/` mobile.
- Score is logged to `.omc/logs/visual-verdict-iter-N.json`.
- Score does NOT gate the merge. Deterministic DOM checks (1-14) are the hard gate.

---

## Implementation Loop Plan (for ralph executor)

### Iteration 0 — Baseline Capture (R12, NEW)
**Goal:** establish a regression-proof baseline of current state before any change.
**Files:** none (read/capture only).
**Actions:**
1. `mkdir -p .omc/research/baseline/{screenshots,exports}`
2. Start dev server. Screenshot all pages at 1440x900 and 375x812:
   - `/`, `/hackathons`, `/contests`, `/meetups`, `/challenges`, `/signals`, `/feedback`, `/signals/new`, `/signals/pending`
3. Save screenshots to `.omc/research/baseline/screenshots/{page}-{viewport}.png`.
4. Capture current `export const` declarations: `grep -rn "^export const \(revalidate\|metadata\|dynamic\|runtime\|fetchCache\|preferredRegion\)" src/app > .omc/research/baseline/exports/exports.txt`
5. Snapshot current `metadata` and `openGraph` in root layout: `cat src/app/layout.tsx | head -20 > .omc/research/baseline/exports/root-metadata.txt`
6. Confirm `npm run build` exits 0 and `npm run lint` exits 0; log output to `.omc/research/baseline/build.log` and `lint.log`.
7. Confirm no existing test suite (`grep -E '"test"' package.json` — expected no match).
8. Confirm no `opengraph-image.*` or `icon.*` files in `src/app/` (confirmed via Glob).
**Acceptance:**
- Baseline artifacts present in `.omc/research/baseline/`.
- Build + lint green.
- NO source file modifications.

### Iteration 1 — Route Group Restructure + Thin Root Layout
**Goal:** move pages into `(excel)` and `(admin)` route groups; create minimal nested layouts; verify URLs + build + byte-identity.
**Files:**
- NEW: `src/app/(excel)/layout.tsx` (placeholder — just `<>{children}</>` for now)
- NEW: `src/app/(admin)/layout.tsx` (placeholder — just `<>{children}</>`)
- MOVED: 12 page files via `git mv`
- MODIFIED: `src/app/layout.tsx` — thin shell (remove SiteNavigation, Footer, sidebar grid, keep metadata byte-identical)
- DELETED: `src/components/layout/site-navigation.tsx`, `src/components/layout/footer.tsx`
- MODIFIED: `src/app/(admin)/signals/pending/page.tsx` — import path fix only (the ONE permitted diff)
**Acceptance:**
- `npm run build` passes.
- `npm run lint` passes.
- Byte-identity diffs for 4 of 5 admin files pass (R5).
- Export snapshot diff shows only path-column changes (R6).
- Every URL in the baseline list resolves to 200 in dev server.
- `openGraph` metadata grep identical before/after (R14).
- `grep -rn "SiteNavigation\|layout/footer\|layout/site-navigation" src` returns zero matches (R17).
- Visual: site looks UNSTYLED / current-minus-sidebar on `(excel)` routes (acceptable — styling comes in iter 3).
- Mobile check at 375px: no horizontal scroll on any page.
- Admin pages (`/signals/new`, `/signals/pending`): pixel-diff vs baseline <1% (R13).

### Iteration 2 — Excel Chrome Components + Tokens
**Goal:** `(excel)` layout wraps children with TitleBar + Ribbon + FormulaBar + SheetTabs + StatusBar. Chrome is visible; content still uses old styles.
**Files:**
- MODIFIED: `src/app/globals.css` (add Excel `@theme` tokens + `.xl-chrome` utility + `--font-xl-chrome`)
- NEW: `src/components/excel/title-bar.tsx`, `ribbon.tsx`, `formula-bar.tsx`, `sheet-tabs.tsx`, `status-bar.tsx`, `ribbon-tabs.ts`
- NEW: `src/lib/excel/route-to-cell.ts`
- MODIFIED: `src/app/(excel)/layout.tsx` — real chrome wrapper
**Acceptance:**
- `npm run build` passes.
- `npm run lint` passes.
- DOM check suite items 1-8, 12-14 pass on all `(excel)` pages.
- DOM check items 9-11 pass on `/signals/new`, `/signals/pending`.
- Mobile: chrome footprint <=200px at 375px; `scrollWidth <= 375` on all in-scope pages.
- Visual-verdict informational score captured (desktop + mobile) to `.omc/logs/visual-verdict-iter-2.json`.

### Iteration 3 — Page Wrapper Cell Styling
**Goal:** every `(excel)` page's outer container adopts flat/square/bordered cell aesthetic.
**Files:** `src/app/(excel)/page.tsx`, `hackathons/page.tsx`, `contests/page.tsx`, `meetups/page.tsx`, `challenges/page.tsx`, `signals/page.tsx`, `feedback/page.tsx`.
**Acceptance:**
- Every page renders without error.
- Outer `rounded-[28/32px]` removed; replaced with square borders.
- Active filter tab color = `bg-[var(--color-xl-green)] text-white`.
- No regression in existing card content.
- `npm run build` / `npm run lint` green.
- DOM check suite passes.
- Mobile check passes.
- Admin pages: pixel-diff vs baseline still <1% (R13).

### Iteration 4 — Card -> Cell Refactor
**Goal:** signal, event, challenge cards adopt square-corner flat cell style with left accent rail preserved.
**Files:** `src/components/signal-card.tsx`, `src/components/event-card.tsx`, `src/components/challenge-card.tsx`.
**Acceptance:**
- All three cards pass visual inspection on their respective `(excel)` pages.
- D-day urgency (red for <=3 days) preserved in event-card.
- signal_type color coding preserved via left border rail.
- No regression in line-clamps or action_point box readability.
- `npm run build` / `npm run lint` green.
- DOM check suite passes.
- Mobile check passes.
- Admin pages: pixel-diff vs baseline still <1% (R13).

### Iteration 5 — Mobile Polish + A11y Audit + Rollout Checks
**Goal:** final polish; verify accessibility tree; capture pass/fail artifacts.
**Files:** tweaks only — probably `layout.tsx`, `ribbon.tsx`, `sheet-tabs.tsx`.
**Acceptance:**
- 375x812 screenshot clean on all `(excel)` pages: no horizontal scroll, chrome footprint <=200px.
- Ribbon and sheet tabs horizontally scrollable with momentum.
- Keyboard Tab sweep on `/` reaches: skip link -> ribbon real nav links (7) -> main content -> sheet tab links (7).
- VoiceOver / screen reader sanity pass: decorative chrome skipped; landmarks named "Primary" and "Sheets".
- `npm run build` / `npm run lint` green.
- Full DOM check suite passes on all `(excel)` pages.
- Visual-verdict informational score logged (do NOT block on it).
- Rollback section verified (git revert dry-run succeeds).

**Iteration cap:** 5 iterations of primary work, up to 2 bug-fix sub-iterations per step. If iteration 5 fails DOM checks, roll back to the last green iteration's state and open a follow-up issue.

---

## Rollback (R20)

This PR has zero database changes, zero API changes, zero auth changes, zero data migrations. Visual-only.

**Rollback procedure:**
```bash
# If the merge commit is at HEAD:
git revert -m 1 <merge-commit-sha>
git push

# If rollback is needed before merge:
git checkout main
git branch -D boss-mode-excel-theme
```

**Rollback safety:**
- Restores the previous visual state exactly.
- Zero data at risk.
- No user action required (no caches to clear, no DB migrations to reverse).
- Visual-only revert is safe and complete.
- If the deletion of `site-navigation.tsx` / `footer.tsx` was cherry-picked before revert, restore them via `git checkout <prior-sha> -- src/components/layout/site-navigation.tsx src/components/layout/footer.tsx`.

---

## Testable Acceptance Criteria (Final State)

Each criterion is independently verifiable.

1. **Build passes.** `npm run build` exits 0.
2. **Lint passes.** `npm run lint` exits 0.
3. **DOM check suite passes** (items 1-14 in the Deterministic DOM Check Suite section). This is the PRIMARY gate (R16).
4. **Byte-identity (admin surfaces).** 4 of 5 admin files in `(admin)/signals/**` are byte-identical to `main`. The 5th file (`pending/page.tsx`) has exactly one diff line: an import path update from `@/app/signals/new/login-form` to the new group-aware path. Verified via the `diff` commands in the Byte-Identity Contract section.
5. **Mobile survival.** At 375px, `document.documentElement.scrollWidth <= 375` on every `(excel)` page AND every `(admin)` page. Chrome vertical footprint sum <=200px on `(excel)` pages.
6. **Admin pixel-parity (R13).** `/signals/new` and `/signals/pending` render effectively identically to Iteration 0 baseline (screenshot diff <1%). Verified by comparing `.omc/research/baseline/screenshots/signals-new-*.png` to post-implementation screenshots.
7. **Chrome presence (deterministic).** Every `(excel)` page has: title bar (green, "thenocodes.xlsx" text), Primary nav with 7 links, formula bar with "fx", Sheets nav with 7 links, status bar with "Ready" + "100%". Verified by DOM queries, not visual judgment.
8. **Accessibility contract.** `nav[aria-label="Primary"]` exists; `nav[aria-label="Sheets"]` exists; no `role="tablist"` anywhere; no `aria-disabled="true"` on `(excel)` pages; exactly one `<main>` per page; skip link is first focusable element.
9. **Untouched surface audit.** `git diff main` shows NO changes under `src/lib/data/`, `src/lib/signals/`, `src/app/api/`, `scripts/`, `supabase/`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `package.json`.
10. **OG preservation (R14).** `openGraph` block in root `src/app/layout.tsx` is character-identical to `main`. No new `opengraph-image.*` or `icon.*` files created.
11. **Dead code removed (R17).** `grep -rn "SiteNavigation\|layout/footer\|layout/site-navigation" src` returns zero matches.
12. **TitleBar vs metadata contract (R18).** Browser tab title shows "더노코즈 - No Code, Only Action" (from `metadata.title`, Korean, branded). TitleBar visual shows "thenocodes.xlsx - Microsoft Excel" (English, decorative, aria-hidden). Both are intentional and must NOT be reconciled.

---

## Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Content readability regresses | Low | High | Card inner typography/padding unchanged; only outer chrome (border, shadow, radius, bg) changes. DOM check suite is structural, not visual. |
| 2 | Mobile chrome eats too much viewport | Low | High | Chrome footprint mathematically budgeted at 138px; mobile check runs every iteration (R8), not just iter 5. |
| 3 | Signal workflow breaks | Very Low | Critical | Admin pages mechanically excluded via `(admin)` route group (R3). Byte-identity enforced via diff (R5). Pixel-parity enforced via screenshot diff (R13). |
| 4 | Route group move causes URL regression | Low | Critical | Next 16 route group docs explicitly confirm folder group names are not included in URL paths. Enforced via "every baseline URL resolves to 200" check in iter 1 acceptance. |
| 5 | Tailwind v4 `@theme` token mismatch | Low | Medium | Project confirmed config-less v4. Tokens added to existing `@theme` block. Smoke test in iteration 2. |
| 6 | Calibri/Segoe UI unavailable on Linux/Korean fonts | Low | Low | Chrome text is English only (R4). Calibri stack falls to system-ui cleanly; no Korean glyph fallback needed. |
| 7 | Dead code (`SiteNavigation`, `Footer`) rots on disk | Eliminated | — | Deleted in same PR (R17). |
| 8 | Hydration mismatch from `usePathname` in ribbon | Low | Medium | Ribbon and SheetTabs are `"use client"`; Next 16 docs confirm `usePathname` renders to HTML on initial load then re-renders client-side. Skip-link and wrappers are server-rendered, so no hydration boundary issue. |
| 9 | Nested layouts cause unexpected re-renders | Low | Low | `(excel)/layout.tsx` and `(admin)/layout.tsx` are both nested (root stays at `src/app/layout.tsx`). Client navigation between `(excel)` and `(admin)` stays client-side per Next 16 docs (full page load penalty only applies if root layout is omitted). |
| 10 | `metadata.openGraph` drift | Low | Medium | Byte-identity diff of root layout's metadata block in iter 1 acceptance (R14). |
| 11 | Visual-verdict judgment is stochastic | Eliminated | — | Visual-verdict demoted to informational; deterministic DOM checks are the primary gate (R16). |
| 12 | Ribbon HOME + SheetTabs HOME redundancy confuses users | Low | Low | Documented as intentional (R19); `aria-current="page"` distinguishes. Two nav landmarks with distinct aria-labels ("Primary" vs "Sheets"). |

---

## Verification Steps (exact commands)

```bash
cd /Users/macmini_cozac/Code/thenocodes.org

# Build + lint
npm run lint
npm run build

# Dev server (background)
npm run dev &

# Byte-identity audits (admin files)
git fetch origin main
diff <(git show origin/main:src/app/signals/new/page.tsx)          src/app/\(admin\)/signals/new/page.tsx
diff <(git show origin/main:src/app/signals/new/login-form.tsx)    src/app/\(admin\)/signals/new/login-form.tsx
diff <(git show origin/main:src/app/signals/new/signal-editor.tsx) src/app/\(admin\)/signals/new/signal-editor.tsx
diff <(git show origin/main:src/app/signals/pending/[id]/page.tsx) src/app/\(admin\)/signals/pending/\[id\]/page.tsx
# Expect: all empty

# Export snapshot
grep -rn "^export const \(revalidate\|metadata\|dynamic\|runtime\|fetchCache\|preferredRegion\)" src/app \
  > .omc/research/post-move/exports.txt
diff .omc/research/baseline/exports/exports.txt .omc/research/post-move/exports.txt
# Expect: only path-column diffs

# URL resolution
for p in / /hackathons /contests /meetups /challenges /signals /feedback /signals/new /signals/pending; do
  curl -sfo /dev/null -w "%{http_code} $p\n" "http://localhost:3000$p"
done
# Expect: all 200

# Dead code audit
grep -rn "SiteNavigation\|layout/footer\|layout/site-navigation" src
# Expect: zero matches

# OG preservation
grep -A 6 "openGraph" src/app/layout.tsx > .omc/research/post-move/og.txt
diff .omc/research/baseline/exports/root-metadata.txt .omc/research/post-move/og.txt
# Expect: empty (after normalizing head/context)

# Untouched surface
git diff --stat origin/main -- src/lib/data src/lib/signals src/app/api scripts supabase next.config.ts postcss.config.mjs package.json
# Expect: empty

# Deterministic DOM checks — run via Playwright or a small node script that hits each URL
node scripts/dom-check.mjs  # (executor writes this helper; it's not a source file change)
```

---

## ADR (Architectural Decision Record)

**Decision:** Adopt Option C (Hybrid: full Excel chrome + cell-style content) scoped to a new `(excel)` route group, with admin pages moved to an `(admin)` route group for mechanical exclusion. Ribbon IS the primary navigation (real `<nav>` + real `<Link>` elements, no semantic fakes).

**Decision Drivers:**
1. Readability must not regress.
2. Mobile viewport (375px) must survive every iteration, not just the last.
3. Admin/workflow surfaces (`/signals/new`, `/signals/pending`, `/api/slack/*`) must remain logic-untouched.

**Alternatives Considered:**
- **Option A** (Full grid-aligned cells): rejected — forces rewrites of card components to fit fixed cell dimensions, regressing readability.
- **Option B** (Sheet tabs only, no ribbon / formula bar): rejected — insufficient Excel recognition signal.
- **Option D** (Pure token swap, no new components): rejected — cannot deliver ribbon or formula bar, the two most recognizable Excel chrome elements. Kept documented as the explicit cheap fallback if the product requirement later relaxes.

**Why Chosen:** Option C delivers maximal Excel recognition (ribbon + formula bar + sheet tabs + status bar all present), preserves content legibility, and mechanically excludes admin surfaces via Next 16 route groups instead of wrapper-only gymnastics. The ribbon becomes honest primary navigation — no `role="tablist"` with `aria-disabled` fake tabs. Chrome copy is English only, avoiding Calibri-vs-Pretendard typeface mixing.

**Consequences:**
- Top-level `src/app/layout.tsx` becomes a thin shell (only `<html>`, `<body>`, metadata, Pretendard link).
- Two nested layouts: `(excel)/layout.tsx` (themed) and `(admin)/layout.tsx` (neutral pass-through).
- 12 page files are moved via `git mv`.
- `SiteNavigation` and `Footer` are deleted in the same PR.
- Every card component gains a flat/square variant while preserving color coding via left border.
- Chrome is entirely English; content stays Korean. Intentional.
- Admin pages visually unchanged from today's state.
- `metadata.openGraph` preserved byte-identical.
- Deterministic DOM checks replace visual-verdict as the hard merge gate; visual-verdict is informational only.

**Follow-ups:**
1. If visual-verdict informational score is consistently low on `(excel)` pages, reconsider adding back a minimal decorative column-letter strip (desktop only, `aria-hidden`, no row numbers).
2. Consider per-page ribbon "DATA" sub-navigation (filters for hackathon status, signal type, challenge kind) in a follow-up PR — explicitly out of scope here.
3. Consider porting the chrome font stack to `next/font/local` with a Calibri-adjacent face if licensing permits.
4. Reconsider whether the `(admin)` nested layout should eventually adopt a lighter Excel theme (e.g., a DATA tab visual) in a follow-up.

---
