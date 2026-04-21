# TheNoCodes Integration & Rebrand Plan v1 (RALPLAN-DR)

**Status:** DRAFT — awaiting Architect + Critic review
**Mode:** DELIBERATE (cross-stack migration + brand retirement — high-risk)
**Author:** Planner
**Date:** 2026-04-21
**Related archive:** `/Users/cozac/Code/UnlearnFit.kr/.omc/plans/unlearnfit-mvp-v1.md` (Rev3 — do not modify)
**Locked premise:** 더노코즈 (TheNoCodes) is the only surviving brand. UnlearnFit / 언런핏 is retired.

---

## 1. Principles (5)

**P1. P1 gate preserved — simulator code still 0 lines until 10 pre-orders.**
The original P1 gate (no simulator feature code until 10 Gumroad pre-orders) applies to *the product*. Rebrand + move of the landing surface is brand/marketing plumbing, not simulator code. This plan MUST NOT ship any RAG/Agent/LangChain/Eval/PE demo backend logic. The 5-tab carousel stays static content.

**P2. Single stack over parallel stacks.**
Running Vercel + Cloudflare + Neon + Supabase in parallel doubles operational surface (DNS, env, secrets, observability, on-call). Converge on the existing thenocodes stack (Cloudflare Workers via OpenNext + Supabase + Tailwind v4) unless there is a hard technical blocker.

**P3. Brand consistency over sunk-cost preservation.**
Gumroad SKU reset (pre-order count 0), Neon project teardown, `unlearnfit.kr` DNS retirement are acceptable costs. The brand-coherence benefit of one name, one domain, one checkout page outweighs the cost of a 2-day-old SKU.

**P4. Data preservation on existing submissions only.**
Any `waitlist_leads` rows collected on the live `unlearnfit-landing.vercel.app` between launch and cutover MUST migrate to Supabase. We do not destroy collected emails — but we do not keep Neon running "just in case."

**P5. Ship rebrand + integration as one atomic cutover, not a long parallel run.**
Parallel-run windows (both brands live, both DBs collecting) = split attention, confused analytics, confused audience. Target: <48h from starting cutover to single-brand live.

---

## 2. Decision Drivers (top 3)

**D1. Time-to-rebrand-live vs migration risk.**
The Vercel deployment is live *now*. Every day parallel, (a) Gumroad pre-orders might trickle in under the wrong brand, (b) audience gets confused if shared to community. Prefer fastest safe path over theoretically optimal port.

**D2. Brand coherence (one product story) vs thenocodes user confusion.**
thenocodes is currently "한국 AI 해커톤·공모전·밋업 aggregator + community." Adding "실무 시뮬레이션 pre-order (19,900원)" is a *product* inside what was until now a *board*. This changes what the site *is*. Navigation, positioning, and expectations all shift.

**D3. Preserving existing thenocodes community momentum vs launching new product affinity.**
The thenocodes site has active commits (discord link, comments, reactions, builder-of-month). Don't break or distract those users. The integration must be additive, not disruptive.

---

## 3. Viable Options (≥2 per axis)

### Axis A — Integration Depth

| Option | What | Pros | Cons |
|---|---|---|---|
| **A1. Full Next.js page port → `/simulator`** | Port `index.html` (1022 lines) + `api/waitlist.ts` to Next.js App Router page + Route Handler / Server Action, Tailwind v4, Supabase. Lives at `thenocodes.org/simulator`. | Single stack; SSR + SEO native; RLS via Supabase; one deploy; Gumroad CTA inside brand chrome (nav + footer). Konsistent UX. | Highest migration effort (~1.5 day). Tailwind v3→v4 class rewrite. Port waitlist API. Existing nav gets a new entry that changes site identity. |
| **A2. Community post (signal)** | Register the simulator pre-order as a `/signals` entry or `/community` post. CTA = external link to existing Vercel landing or Gumroad. | Near-zero code. Uses existing content system. Non-disruptive. | Does NOT retire UnlearnFit brand (Vercel page still exists externally). Fails the brand-unification premise. Pre-order page still on `*.vercel.app`. Rejected. |
| **A3. Subdomain alias** `unlearn.thenocodes.org` | Point subdomain CNAME at Vercel. Shared brand via domain only. | Zero code change to landing. | User explicitly weakened this option with brand-unification decision. Still two stacks, two DBs, two deploys. Rejected. |
| **A4. Iframe embed inside `/simulator`** | Next.js page = shell + `<iframe src="vercel-landing-url">`. | Fast cutover. | Awful UX (scroll, mobile, analytics). CSP + `X-Frame-Options: DENY` already set. Rejected. |

**Recommendation: A1 (full port)** — the brand decision already paid the migration cost; do it once, correctly. A2/A3/A4 all leak the retired brand.

### Axis B — Database Strategy

| Option | What | Pros | Cons |
|---|---|---|---|
| **B1. Migrate `waitlist_leads` → Supabase; scrap Neon** | `CREATE TABLE waitlist_leads` in Supabase migration `00012_waitlist.sql`. Export Neon rows via `pg_dump --data-only`, import via `psql`. Tear down Neon project. | One DB. Existing Supabase RLS patterns (see `00006_fix_rls_policies.sql`). SSR data access native. Existing `thenocodes` DB backup/monitoring covers it. | ~2h data migration work. Need to recreate role-least-privilege pattern in Supabase (service-role key for INSERT via Server Action; RLS denies anon read). |
| **B2. Keep Neon as separate backend** | Next.js `/simulator` page calls Neon via `@neondatabase/serverless` using existing `waitlist_writer` role. | Preserves just-built Neon schema + roles + salt. Zero data migration. | Two DBs in one app = two sets of secrets, two connection strings in Cloudflare env, two things to monitor. Violates P2. |
| **B3. Scrap Neon + start fresh in Supabase; discard existing leads** | Nuke Neon. Start counter at 0. | Cleanest. | Destroys whatever leads were collected (even 2 is worth keeping — those are real humans who opted in under PIPA consent). Violates P4. |

**Recommendation: B1 (migrate to Supabase, scrap Neon)** — honors P2 + P4. Use Supabase Server Action with service-role `SUPABASE_SERVICE_ROLE_KEY` bound to INSERT-only behavior (enforced at Server Action layer, not at DB role — Supabase's model). RLS policy: `anon` and `authenticated` DENY all on `waitlist_leads`; only service-role writes via server.

### Axis C — Deploy Strategy

| Option | What | Pros | Cons |
|---|---|---|---|
| **C1. Single Cloudflare Workers (OpenNext)** | `thenocodes` already deploys via `opennextjs-cloudflare deploy`. Add `/simulator` route. Retire Vercel deployment. | One CDN, one build, one deploy command. | Must verify Supabase SSR client + OpenNext compatibility (it works — `@supabase/ssr` is already in deps). |
| **C2. Dual Vercel + Cloudflare** | Keep Vercel landing, point `simulator.thenocodes.org` subdomain at it. | Zero port work. | Violates P2 + Axis A decision. |
| **C3. All on Vercel (move thenocodes)** | Port thenocodes off Cloudflare. | Vercel has Next.js 16 first-class support. | Massive scope blowup; thenocodes is already productive on Cloudflare. Rejected. |

**Recommendation: C1 (single Cloudflare Workers).**

### Axis D — Pre-order SKU (Gumroad)

| Option | What | Pros | Cons |
|---|---|---|---|
| **D1. Create new 더노코즈 Gumroad SKU** | New SKU under "더노코즈 실무 시뮬레이션" product title, `gum.co/NEW_SKU`. Old SKU archived. Counter resets to 0. | Brand-consistent. Clean start. | Loses any pre-orders collected on old SKU (should be 0–few given P1 gate never opened). |
| **D2. Keep UnlearnFit SKU, rebrand listing copy** | Edit existing Gumroad product title/description to 더노코즈. URL stays `gum.co/UNLEARNFIT_SKU`. | Preserves SKU + any pre-orders + URL backlinks. | Product slug still contains `unlearnfit` in URL forever. Brand leak. Gumroad slug is immutable on some plans. |
| **D3. Defer Gumroad until rebrand stable** | Disable CTA, replace with "출시 알림 받기" that links to waitlist only. Re-enable Gumroad post-cutover. | Zero risk of split-brand checkout during cutover. | Removes the 19,900원 conversion path during the cutover window (24–48h). |

**Recommendation: D1 (new SKU) + D3 interim** — during cutover window (≤48h) use D3 (waitlist-only CTA), then flip to D1 (new 더노코즈 SKU). This is consistent with P1 since no pre-orders are expected yet (simulator code is 0 lines).

### Axis E — `unlearnfit.kr` domain handling (added)

| Option | What | Pros | Cons |
|---|---|---|---|
| **E1. 301 redirect to `thenocodes.org/simulator`** | Cloudflare DNS + worker does `301 unlearnfit.kr/* → thenocodes.org/simulator`. | Preserves any backlinks. SEO-safe. Email forwarding from `hello@unlearnfit.kr` can stay 6 months then retire. | Small DNS work. |
| **E2. Park domain (holding page)** | Static "moved to 더노코즈" page. | Simpler. | Breaks any direct backlinks. |
| **E3. Let domain lapse** | No renewal. | Free. | Any future traffic lost forever. Risk of squatter. User owns the domain — should retain. |

**Recommendation: E1 (301 redirect).**

---

## 4. Recommended Decision (consolidated)

| Axis | Choice | Rationale |
|---|---|---|
| A Integration depth | **A1 Full Next.js port → `/simulator`** | Brand premise demands it. |
| B Database | **B1 Migrate leads → Supabase, scrap Neon** | P2 single stack. |
| C Deploy | **C1 Cloudflare Workers only** | P2 single stack. |
| D Gumroad | **D3 interim (waitlist-only) → D1 new SKU** | Low risk during cutover, clean brand at launch. |
| E `unlearnfit.kr` | **E1 301 redirect** | Preserve backlinks, retain domain. |

---

## 5. Pre-Mortem (4 failure scenarios)

**S1. "Brand confusion drops conversion."**
*Symptom:* thenocodes users visit `/simulator`, don't understand why a hackathon board is selling a 19,900원 course. Conversion on waitlist drops vs. dedicated landing.
*Root cause risk:* Mixing aggregator-brand + product-brand in one nav.
*Mitigation:* `/simulator` page has its own standalone hero that positions the product clearly ("실무 시뮬레이션 — 더노코즈의 첫 자체 제품"). Nav entry labeled clearly. Run an A/B by keeping the Vercel URL accessible via `simulator-legacy.thenocodes.org` for 2 weeks, compare conversion.
*Pre-commit trigger:* If post-cutover conversion is <50% of the Vercel-standalone baseline, reassess integration depth.

**S2. "Neon→Supabase migration drops rows."**
*Symptom:* Rows collected on Vercel between now and cutover don't make it into Supabase.
*Root cause risk:* Schema mismatch (Neon has `ip_hash text`, Supabase might expect `inet`), timezone differences, unique-index conflict on `lower(email)`.
*Mitigation:* Dry-run `pg_dump` + diff schemas before cutover. Freeze the Vercel form (disable submit) 10 min before migration. Verify row count match post-import. Migration script in `supabase/migrations/00012_waitlist.sql` creates the table; a separate one-shot `scripts/migrate-neon-to-supabase.mjs` does the data copy with idempotency on `(lower(email))`.

**S3. "Cloudflare Workers runtime breaks the Supabase/Neon HTTP driver."**
*Symptom:* `/api/waitlist` returns 500 in prod but not in `next dev`.
*Root cause risk:* `nodejs_compat` flag already set, but `@supabase/supabase-js` uses `fetch` natively — should work. `@neondatabase/serverless` would also work but we're removing Neon. Risk is primarily `node:crypto` usage in the salt/hash logic.
*Mitigation:* Use `crypto.subtle.digest` (Web Crypto) instead of `node:crypto.createHash` in the ported waitlist handler. Test on `npm run preview` (runs `wrangler dev` against the built worker) before `deploy`.

**S4. "Tailwind v3 CDN → Tailwind v4 PostCSS class-name breakage."**
*Symptom:* Ported `/simulator` page renders unstyled or partially styled because Tailwind v4 renamed/removed some utilities from v3.
*Root cause risk:* UnlearnFit landing uses `cdn.tailwindcss.com` (v3). thenocodes uses `@tailwindcss/postcss` v4. Classes like `bg-opacity-*`, `transform`, some gradient utilities changed.
*Mitigation:* Port in a feature branch. Run `npm run build` (webpack mode per `package.json`) and visually diff against the Vercel live page. Use Tailwind v4 upgrade codemod if available. Accept that some bespoke classes may need `@apply` in `globals.css` or swapped to modern equivalents.

---

## 6. Risks (8)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Data loss during Neon→Supabase migration | Low | High | Dry-run + idempotent import + row-count verification gate |
| R2 | Gumroad SKU reset loses pre-orders | Low (near-zero have been placed) | Low | D3 interim defer; D1 new SKU at launch |
| R3 | thenocodes users confused by product scope | Med | Med | Dedicated hero/positioning copy on `/simulator`; community announcement post |
| R4 | Tailwind v3→v4 class-name breakage | Med | Med | Branch + visual diff + codemod |
| R5 | CF Workers runtime ↔ Node APIs (`node:crypto`) | Med | Med | Port to `crypto.subtle`; `npm run preview` before deploy |
| R6 | Supabase RLS setup wrong, leaks emails | Low | High | RLS policy review; `anon` + `authenticated` DENY SELECT; only service-role writes via server |
| R7 | DNS mis-cut: `unlearnfit.kr` or `thenocodes.org` downtime | Low | High | Do DNS change Friday evening KST; pre-test with `dig @resolver`; low-TTL 60s before cutover |
| R8 | Email deliverability on `hello@thenocodes.org` not configured | Med | Med | Set SPF/DKIM/DMARC on `thenocodes.org` *before* publishing new email anywhere |

---

## 7. Phases

Label convention: `TN-P{n}` = TheNoCodes integration phase n.

### TN-P0 — Pre-cutover checks (½ day)

**Objective:** Verify assumptions, prepare branches, no production changes.

1. Clone `thenocodes/site` to a feature branch `feat/simulator-integration`.
2. Verify Supabase local dev works (`supabase start`).
3. Verify `npm run preview` (OpenNext → Wrangler) succeeds on current main.
4. Audit UnlearnFit `index.html` for all Tailwind v3-specific classes (grep for `bg-opacity-`, `transform`, old gradient syntax).
5. Count existing `waitlist_leads` rows in Neon (`psql $NEON_WAITLIST_READ_URL -c 'select count(*) from waitlist_leads'`).
6. Record Gumroad old SKU URL, screenshot product page for archive.
7. Configure SPF/DKIM/DMARC for `thenocodes.org` if not already (check DNS provider).

**Acceptance:**
- Feature branch created, builds cleanly.
- Row count captured (will be target for migration verification).
- Email DNS records verified with `dig thenocodes.org TXT`.

### TN-P1 — Supabase schema + RLS (½ day)

**Objective:** Create `waitlist_leads` + `waitlist_rate_limits` in Supabase with least-privilege RLS.

1. Create `supabase/migrations/00012_waitlist.sql`:
   - `CREATE TABLE waitlist_leads` — mirror Neon schema (`uuid`, `email`, `jd_url`, `company_name`, `role_hint`, `marketing_consent`, `ip_hash`, `user_agent`, `created_at`).
   - `CREATE TABLE waitlist_rate_limits`.
   - Indexes: `lower(email)` unique, `created_at DESC`, `window_start`.
   - `ALTER TABLE waitlist_leads ENABLE ROW LEVEL SECURITY`.
   - Policy: DENY all for `anon` + `authenticated` roles. No SELECT, no INSERT via client. (Service-role bypasses RLS by default.)
   - Same for `waitlist_rate_limits`.
2. Apply migration locally (`supabase db push` against local) and verify with `psql`.
3. Apply to remote Supabase project.
4. Update `.env.local.example` with new env vars: `SUPABASE_SERVICE_ROLE_KEY` (already exists?), `WAITLIST_DAILY_SALT`.

**Acceptance:**
- Both tables exist in remote Supabase.
- RLS denies `SELECT` from `anon` key (test: `curl` with anon key → empty/403).
- Service-role INSERT works (test via `supabase sql` or node script).

### TN-P2 — Next.js `/simulator` page + Server Action (1 day)

**Objective:** Port `index.html` → Next.js RSC page; port `api/waitlist.ts` → Server Action.

1. Create `src/app/simulator/page.tsx`:
   - Server Component.
   - Hero, waitlist form (Client Component subtree for interactivity).
   - 5-tab demo carousel (RAG/Agent/LangChain/Eval/PE) — static content, Client Component for tab state.
   - Pricing section with Gumroad CTA — during cutover use `#waitlist` anchor (D3); post-cutover replace with new Gumroad URL (D1).
   - Refund guarantee, FAQ.
   - Metadata: title/OG for `/simulator`.
2. Create `src/app/simulator/actions.ts` — Server Action `submitWaitlist(formData)`:
   - Zod validate (`@supabase/ssr` already on zod v4 — confirm schema compiles).
   - Honeypot check (return early success on bot fill).
   - Rate-limit: upsert into `waitlist_rate_limits` keyed on `sha256(ip + daily_salt)`.
   - INSERT into `waitlist_leads` via service-role Supabase client.
   - Use `crypto.subtle.digest('SHA-256', ...)` — Web Crypto, not `node:crypto` (CF Workers compat).
   - Return `{ ok: true }` or `{ ok: false, reason }`.
3. Create `src/app/simulator/_components/waitlist-form.tsx` — `"use client"`, uses `useActionState` (React 19).
4. Add `/simulator` to nav? — **Decision: yes, but under a distinct section.** Update `site-navigation.tsx` to add a "제품" (Product) section with just "실무 시뮬레이션" entry. Keeps aggregator and product visually separated per D2/S1 mitigation.
5. Update root `layout.tsx` metadata — no change needed; per-route metadata handles it.
6. Port `thank-you.html` → `src/app/simulator/thank-you/page.tsx`.
7. Port `privacy.html` + `terms.html` → `src/app/legal/privacy/page.tsx` + `/terms/page.tsx` (shared across brand).

**Acceptance:**
- `npm run dev` → `http://localhost:3000/simulator` renders hero + form + tabs + pricing + FAQ visually matching the Vercel live page (±minor Tailwind v4 drift).
- Form submission from browser inserts a row into local Supabase `waitlist_leads`.
- Honeypot-filled submission returns 200 without DB write.
- Rate-limit triggers after N attempts from same IP hash (test via curl loop).
- `npm run preview` (Wrangler-hosted) serves the page without runtime errors.
- Navigation sidebar shows new "제품 → 실무 시뮬레이션" section; existing routes still work.

### TN-P3 — Data migration Neon → Supabase (¼ day)

**Objective:** Move whatever leads exist; verify integrity.

1. Freeze the live Vercel waitlist: deploy a temporary `api/waitlist.ts` that returns `{ ok: false, reason: "moving_brand" }` with 200 (silent to not leak brand move to bots). Or simply disable via vercel.json rewrite. Announce to any subscribers.
2. `pg_dump` data-only from Neon: `pg_dump -a -t waitlist_leads -t waitlist_rate_limits $NEON_OWNER_URL > waitlist.sql`.
3. Strip `ON CONFLICT` / tune for Supabase target (schema already created in TN-P1).
4. Run via `supabase db push --db-url $SUPABASE_DIRECT_URL` or `psql`. Use `ON CONFLICT (lower(email)) DO NOTHING` to be idempotent.
5. Verify: row count in Supabase == row count snapshot from TN-P0.
6. Mark Neon project for deletion (wait 7 days before actual delete — safety buffer).

**Acceptance:**
- Row count matches.
- Sampling 3 rows: email, jd_url, created_at all match Neon source.
- Local Supabase `waitlist_leads` contains the migrated rows after `supabase db pull`.

### TN-P4 — Gumroad + rebrand content sweep (½ day)

**Objective:** Replace all UnlearnFit branding.

1. Global find+replace across `src/app/simulator/**`:
   - `UnlearnFit` → `더노코즈 실무 시뮬레이션` (product context) or `더노코즈` (brand context).
   - `언런핏` → `더노코즈`.
   - `hello@unlearnfit.kr` → `hello@thenocodes.org`.
   - `unlearnfit.kr` → `thenocodes.org`.
2. Update Gumroad placeholder `gum.co/PLACEHOLDER_SKU` → anchor `#waitlist` during cutover (D3).
3. Create new Gumroad product "더노코즈 실무 시뮬레이션" (post-cutover in TN-P6).
4. Update OG/Twitter images — swap logos/copy. Store under `public/og/simulator.png`.
5. Update `public/favicon.ico` if it was UnlearnFit-branded (thenocodes already has one).
6. Sanity check: grep the entire `/simulator` tree for `unlearnfit|언런핏|UnlearnFit` — zero hits.

**Acceptance:**
- `grep -ri "unlearnfit\|언런핏" src/app/simulator/` returns 0 matches.
- Gumroad CTA click scrolls to waitlist form (no external redirect during cutover window).

### TN-P5 — Deploy + DNS cutover (½ day)

**Objective:** Ship to production; retire Vercel.

1. `npm run build` (webpack, per existing script) — verify clean.
2. `npm run preview` — smoke-test `/simulator`, `/community`, `/signals`, `/openclaw`, home all work.
3. Merge `feat/simulator-integration` → `main`.
4. `npm run deploy` (`opennextjs-cloudflare deploy`) — push to Cloudflare Workers.
5. Verify `thenocodes.org/simulator` live.
6. Set DNS: `unlearnfit.kr` 301 → `thenocodes.org/simulator` via Cloudflare Page Rules or a minimal Worker.
7. Monitor Cloudflare Workers logs + Supabase logs for 30 min post-deploy.

**Acceptance:**
- `curl -I https://thenocodes.org/simulator` → 200.
- `curl -I https://unlearnfit.kr` → 301 with `Location: https://thenocodes.org/simulator`.
- `curl -I https://unlearnfit-landing.vercel.app` → either still live (fine — deprecated) or 301.
- 4 existing routes smoke-tested: `/`, `/community`, `/signals`, `/openclaw` load with <500ms SSR.
- No Tailwind console warnings.
- Form submission from production `thenocodes.org/simulator` inserts row into production Supabase.

### TN-P6 — Gumroad swap + community announcement (¼ day)

**Objective:** Flip from D3 → D1; announce rebrand.

1. Create new Gumroad product "더노코즈 실무 시뮬레이션 Pre-order", 19,900원.
2. Update `/simulator` CTA: `#waitlist` anchor → `https://gum.co/NEW_SKU`.
3. Deploy.
4. Write `/community` announcement post: "더노코즈에서 첫 자체 제품을 시작합니다 — 실무 시뮬레이션 (19,900원 pre-order)." Link to `/simulator`.
5. Pin the post for 7 days.
6. Update discord channel topic to include `/simulator` link.

**Acceptance:**
- Gumroad checkout from `/simulator` completes (test with actual 0원 test purchase or delete after).
- Announcement post published on `/community`.

### TN-P7 — Vercel + Neon teardown (after 14-day safety window)

**Objective:** Clean up old infrastructure.

1. T+14 days: delete Vercel project `unlearnfit-landing`.
2. T+14 days: delete Neon project `solitary-dream-45287542`.
3. Remove Neon env vars from `.env.local.example` and any documentation.
4. Archive this plan as `thenocodes-integration-v1-DONE.md`.

**Acceptance:**
- Vercel project no longer listed.
- Neon project no longer listed.
- No references to `NEON_WAITLIST_*` in the thenocodes codebase.

---

## 8. Expanded Test Plan (DELIBERATE mode)

### Unit (Server Action layer)
- Zod schema accepts valid payloads, rejects invalid emails / missing jd_url / oversized strings.
- Honeypot returns `{ ok: true }` without DB call.
- IP hash is deterministic given same IP + salt, different across days.
- Rate-limit math: N attempts within window = blocked, window expiry = unblocked.

### Integration (local Supabase)
- Valid submission → row in `waitlist_leads`.
- Duplicate email (case-insensitive) → reject via unique index, user sees graceful message.
- Rate-limit cap triggers 429-equivalent return.
- Service-role INSERT works; `anon`-key INSERT rejected by RLS.
- `waitlist_rate_limits` upsert is atomic (no race under concurrent submits).

### End-to-End (preview / prod smoke)
- Open `/simulator` in browser; visual match to Vercel baseline (screenshot diff).
- Fill form, submit, land on `/simulator/thank-you`.
- 5-tab carousel switches tabs without full page reload.
- Mobile viewport 390×844: form usable, no horizontal scroll.
- Nav: click each of existing `/community`, `/signals`, `/openclaw`, `/meetups`, `/hackathons` — all work.

### Observability
- Cloudflare Workers analytics: `/simulator` request count visible.
- Supabase Dashboard → `waitlist_leads` → new row appears within 5s of submission.
- Error tracking: add `console.error` with request-id in Server Action failure paths; spot-check Cloudflare tail logs.
- Daily check (7 days post-cutover): row count delta, 404 rate on `/simulator`, 301 redirect count on `unlearnfit.kr`.

### Security
- `curl` Supabase REST with anon key on `waitlist_leads` → empty/403.
- `/api/*` not exposing any waitlist endpoint publicly (Server Action only, not a public Route Handler — confirm).
- CSP headers preserved (port from `vercel.json` to Next.js middleware or `next.config.ts` headers).
- No `SUPABASE_SERVICE_ROLE_KEY` in client bundle (Next.js server-only guard).

---

## 9. ADR (Architectural Decision Record)

**Decision:**
Port UnlearnFit landing to `thenocodes.org/simulator` as a Next.js App Router page with a Supabase-backed Server Action for waitlist submissions. Retire UnlearnFit brand, Vercel deployment, and Neon database. Redirect `unlearnfit.kr` to `thenocodes.org/simulator`. Interim Gumroad CTA becomes a waitlist anchor during cutover, then swaps to a new 더노코즈-branded SKU at launch.

**Drivers:**
1. Brand-unification decision (locked by user) makes parallel stacks + parallel brands a dead end.
2. Operational single-stack principle (P2) — one DB, one deploy pipeline, one domain.
3. Time-to-coherence pressure: every day of parallel brand = audience confusion and split analytics.

**Alternatives considered:**
- *A2 Community post:* Rejected — leaves UnlearnFit brand alive on Vercel, fails brand retirement.
- *A3 Subdomain alias:* Rejected — same (brand still lives on Vercel, just fronted by new DNS).
- *A4 Iframe embed:* Rejected — UX disaster, breaks mobile, analytics.
- *B2 Keep Neon alongside Supabase:* Rejected — violates P2, doubles ops surface.
- *B3 Scrap leads entirely:* Rejected — violates P4, destroys PIPA-consented data.
- *C2/C3 Dual or Vercel-only deploy:* Rejected — C2 violates single-stack; C3 is massive unrelated scope.
- *D2 Rename Gumroad SKU in place:* Rejected — URL slug often contains legacy brand immutably.

**Why chosen (recommended consolidated path):**
Axis A1 + B1 + C1 + D3→D1 + E1 is the only combination that (a) achieves full brand retirement, (b) preserves collected-lead data, (c) converges to one stack, (d) avoids risky brand-split during cutover, and (e) preserves SEO on the retired domain. Each alternative path either leaks the retired brand, fragments operations, or destroys data. The migration cost (~2.5–3 days total) is paid once and amortized over the life of the product.

**Consequences (+):**
- Single brand, single domain, single stack — simpler operations forever.
- Supabase RLS gives better long-term lead-data security than Neon role-grants.
- `/simulator` benefits from existing thenocodes SSR + CDN + community nav.
- Lead data preserved.
- `unlearnfit.kr` backlinks retained via 301.

**Consequences (−):**
- 2.5–3 days of migration work before first pre-order can flow through new SKU.
- Gumroad SKU counter resets to 0 (near-zero cost given P1 gate).
- Tailwind v3→v4 class-name drift may require minor visual polish after cutover.
- Cutover introduces a ≤48h window where the `/simulator` page shows a waitlist-only CTA (no pre-order checkout) — acceptable given no simulator code exists yet anyway.
- Cloudflare Workers runtime means `node:crypto` is out; must use Web Crypto.

**Follow-ups (post-launch):**
- FU1. Monitor waitlist conversion on new integrated page for 2 weeks; if <50% of prior Vercel standalone baseline, evaluate re-adding a dedicated landing route like `/simulator/standalone` without nav chrome.
- FU2. Add analytics event for Gumroad CTA click (Plausible or Cloudflare Web Analytics) once D1 swap is done.
- FU3. Revisit P1 gate: once 10 pre-orders arrive on new SKU, unlock simulator feature development per original plan.
- FU4. Consider a shared `waitlist` component for future thenocodes products beyond the simulator.
- FU5. 14 days post-cutover: confirm no orphan references to `unlearnfit` in repo, codebase docs, env var names, or CI secrets; finalize Vercel+Neon teardown.
- FU6. Email: set up `hello@thenocodes.org` inbox + shared team access; ensure SPF/DKIM/DMARC healthy for outbound (deliverability monitor via mail-tester.com).

---

## 10. Success Criteria (checklist)

- [ ] `thenocodes.org/simulator` returns 200 and renders hero + form + 5-tab carousel + pricing + FAQ.
- [ ] Waitlist submission inserts row into Supabase `waitlist_leads`.
- [ ] `grep -ri "unlearnfit\|언런핏" src/` returns 0 matches.
- [ ] `/`, `/community`, `/signals`, `/openclaw`, `/meetups`, `/hackathons` all load without regression.
- [ ] `unlearnfit.kr` returns 301 → `thenocodes.org/simulator`.
- [ ] Previously collected `waitlist_leads` rows (from Neon) are present in Supabase with matching count.
- [ ] Tailwind v4 build has zero class-not-found errors in console/build log.
- [ ] New 더노코즈 Gumroad SKU created and CTA links work end-to-end.
- [ ] Supabase RLS denies `anon`-key SELECT on `waitlist_leads` (verified via curl).
- [ ] Neon project scheduled for deletion on T+14; Vercel project scheduled for deletion on T+14.
- [ ] Community announcement post published and pinned on `/community`.

---

## 11. Open Questions (for user before execution)

Written also to `.omc/plans/open-questions.md`:

- [ ] **Nav placement:** Do you want `/simulator` under a new "제품" section (my recommendation for clarity per S1) or mixed into the main nav? — *Affects site-navigation.tsx changes in TN-P2.*
- [ ] **Cutover timing:** Weekend evening KST acceptable for DNS + migration? — *Affects TN-P5 scheduling.*
- [ ] **Community post tone:** Should the rebrand announcement be a marketing-style pinned post, or low-key builder-log entry? — *Affects TN-P6 copy.*
- [ ] **hello@ email:** Does `hello@thenocodes.org` exist already, or do we need to provision it? — *Blocks legal/privacy page updates in TN-P4.*
- [ ] **Existing thenocodes `/simulator` or `/problem-bank` conflicts:** Nav already references `/problem-bank` (which doesn't yet exist as a route). Is `/simulator` the final URL, or is there a Korean variant preferred (e.g., `/실무-시뮬레이션`, `/practice`)? — *Affects TN-P2 routing.*
- [ ] **PIPA re-consent:** Rebranding from UnlearnFit → 더노코즈 may legally require informing existing waitlist subscribers of the brand change. Does your marketing_consent text cover brand rename? — *Affects whether a one-time notification email is needed pre-cutover.*

---

## 12. Deliverables (this plan)

- This file: `/Users/cozac/Documents/Codex/2026-04-17-thenocodes/site/.omc/plans/thenocodes-integration-v1.md`
- Archival (untouched): `/Users/cozac/Code/UnlearnFit.kr/.omc/plans/unlearnfit-mvp-v1.md`
- Open questions: append to `/Users/cozac/Documents/Codex/2026-04-17-thenocodes/site/.omc/plans/open-questions.md`

**Ready for Architect review, then Critic review.**
