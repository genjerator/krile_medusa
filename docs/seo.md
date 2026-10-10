# SEO Dashboard — Discussion

Working doc for building an SEO/analytics dashboard that pulls **Google Analytics 4**,
**Google Search Console**, and **Bing Webmaster** data into one place. Living document —
we iterate here before writing code.

Context: two storefronts, so everything is **multi-property** from day one:
- `planeta.de` (Planeta GmbH shop) — GA4 property + GSC property + Bing site
- `planetaindustries.de` (Planeta Industries) — GA4 property + GSC property + Bing site

Motivation: measure the impact of the recent on-page SEO fixes (titles, meta, H1s,
`/products`→`/product` redirect, sitemap) and track organic growth over time.

---

## 0. Product direction — internal tool → possibly a product

Intent has evolved: use it for our Medusa stores first, but **potentially offer it to other
users** — maybe as a **separate tool**. Observation driving it: *lots of SEO tools exist, but
you have to stitch several together to get what you actually need.*

### The wedge (what makes it not "just another SEO tool")
Unifying GA4 + GSC + Bing + Keyword Planner alone is thin — Looker Studio and others already
blur into that. The **defensible differentiator is commerce-aware SEO**:

> Generic SEO tools (Ahrefs, Semrush, GSC) know your *rankings* but are blind to your
> **catalog and revenue**. A Medusa-native tool can join
> "category X ranks #6 for *vakuumierer*, 1,200 impressions, 40 clicks" **with**
> "→ 3 orders, €890 revenue, these SKUs." No generic tool can do this without integrating the store.

The multi-source unification is table stakes; **the product/revenue join is the moat.**

### What changes if it becomes a product (vs internal-only)
| Concern | Internal-only | Multi-tenant product |
|---|---|---|
| Google/Bing auth | **one service account** we grant access to | **per-tenant OAuth** — each customer connects their own GA4/GSC/Bing/Ads |
| Google verification | not needed | **required** — `analytics.readonly` / `webmasters.readonly` are sensitive/restricted scopes → Google brand+security review (weeks). ⚠️ gating item, plan early |
| Data model | our brands | **workspaces/orgs, users, roles, per-tenant encrypted tokens** |
| Billing | none | subscriptions, plans, usage limits |
| Core architecture | Option A (Medusa admin) fine | **Option B (standalone multi-tenant)** core, Medusa = a plugin/channel |

### DECISION (locked, 2026-08)
1. **Ship a FREE, open Medusa plugin first** (public npm). Distribution + demand validation, no gating/billing.
2. **If adoption is strong → build the multi-tenant SaaS** (per-tenant OAuth, verification, billing).

**Why free-first is also the low-friction technical path:** each merchant self-hosts and supplies
**their own** Google service account + Bing key via plugin `options`/env → **no OAuth app, no consent
screen, no Google verification**. That review only reappears in the hosted SaaS phase.

**Design so the SaaS isn't a rewrite:** keep the real logic (API pulls, metric normalization, commerce
join) in the module **service + workflow steps**, framework-light. The SaaS later lifts that core into a
hosted backend and swaps "read this Medusa DB" for "read tenant X's connected data." Don't build
multi-tenant plumbing now; don't bury logic in Medusa-only glue either.

### v1 scope — the free plugin (ship the wedge, not the kitchen sink)
- `seoMetrics` module + **daily ingestion job** for **GA4 + GSC** (Bing + Keyword Planner → v1.1/v2)
- Admin "SEO" page: date-range control, KPI cards (users/new users, clicks/impressions/CTR/position),
  one trend chart, top-queries table, top-pages table
- **Differentiator screen (the reason to build this):** join GSC pages → Medusa products/categories by
  handle → show organic clicks/impressions next to **orders/revenue per product**. Even a simple
  "top product pages by organic clicks, with revenue" is something no generic SEO tool can do — and it's
  easy *because* we're inside Medusa (direct catalog/order access via module links).

### Plugin packaging (Medusa v2, confirmed against docs)
- Scaffold: `npx create-medusa-app my-seo-plugin --plugin` (gives `src/modules|api|admin|jobs|workflows|links`)
- Local test: `npx medusa plugin:publish` (Yalc) → in a test app `npx medusa plugin:add <name>`, register in
  `medusa-config` `plugins:[{resolve,options}]`; `npx medusa plugin:develop` to watch/rebuild
- Migrations: `npx medusa plugin:db:generate` (in plugin) → `npx medusa db:migrate` (in app)
- Publish: `npx medusa plugin:build` → `npm publish`. Users: `npm install <name>` + config + `db:migrate`.
- Credentials via plugin `options` (GA4 property + service-account JSON, GSC site, Bing key).

---

## 1. What we want to see (the dashboard)

**Overview KPIs (per brand, with period-over-period delta):**
- GA4: active users, **new users**, sessions, engaged sessions, avg. engagement time
- GSC: total **clicks**, **impressions**, avg **CTR**, avg **position**
- Bing: clicks, impressions

**Detail panels:**
- Trend charts (users / clicks / impressions over time, e.g. last 28/90 days)
- **Top search queries** (GSC + Bing): clicks, impressions, CTR, position — filterable by page
- **Top landing pages**: organic entrances, clicks, impressions
- Countries / devices breakdown
- "Movers": queries/pages with biggest position or click change vs previous period
- (later) Index coverage / crawl stats from GSC + Bing

---

## 2. Data sources & how to access them

| Source | API | Auth | Notes / gotchas |
|---|---|---|---|
| **GA4** | Google Analytics **Data API v1** (`runReport`) | Service account → add as **Viewer** on the GA4 property | Metrics: activeUsers, newUsers, sessions… Dimensions: date, country, pagePath, sessionDefaultChannelGroup, sessionSource. Fresh (near-realtime available; daily is plenty). |
| **Google Search Console** | **Search Analytics API** (`searchanalytics.query`) | Same service account → add as **user** on each GSC property | Dimensions: query, page, country, device, date. **~2–3 day data lag.** Max 25k rows/query, paginate. Only ~16 months history. |
| **Bing Webmaster** | **Bing Webmaster API** | **API key** (from Bing Webmaster Tools) | Query stats, page stats, crawl stats. Smaller data volume; different shape than GSC. |
| **Keyword Planner** | **Google Ads API** — `KeywordPlanIdeaService.generateKeywordIdeas` / `generateKeywordHistoricalMetrics` | OAuth2 (or service acct) + **developer token** + Google Ads account | Keyword ideas from seed terms **or a URL**, with avg monthly searches, competition (LOW/MED/HIGH), top-of-page bid ranges, 12-mo trend. **Caveat 1:** developer token needs Basic-access approval (days). **Caveat 2:** volumes are **ranged/bucketed without active ad spend** — directional, not exact. |

### Keyword Planner — role in the tool
Complements GSC, doesn't duplicate it:
- **GSC** = what we *actually* rank for and get today (real, our pages).
- **Keyword Planner** = what the *market* searches for — volumes for terms we don't rank for yet → find opportunities.
Feature: **"Keyword research" panel** — enter a seed term or paste a product/category URL → ideas + volume + competition → cross-reference GSC to surface "high volume, we don't rank yet" gaps.
Alternative if Ads-account friction / ranged volumes are a dealbreaker: paid 3rd-party APIs (DataForSEO, SerpApi, Semrush/Ahrefs) give exact volumes for a monthly fee.

**Auth recommendation:** one **Google service-account** JSON key for both GA4 + GSC
(server-to-server, no interactive OAuth). Grant it read access on all four Google
properties. Bing uses a separate API key. Store all secrets server-side (env/secrets),
never in the browser.

---

## 3. Architecture — three options

### Option A — Medusa Admin extension (RECOMMENDED)
A custom **admin page** ("SEO") inside the existing `krile_medusa` backend, backed by a
new Medusa **module** (`seoMetrics`) + **API routes** that call Google/Bing server-side.

- **+** Reuses existing auth (merchant already logs into admin), infra, deploy, DB.
- **+** Secrets stay on the Medusa server; the browser only hits our own `/admin/seo/*` routes.
- **+** Fits the pattern we already use (custom modules everywhere).
- **−** Admin UI is constrained to Medusa's admin shell / component style.

### Option B — Standalone Next.js dashboard
A separate small app (could reuse the storefront stack).
- **+** Total freedom over charts/UX; not tied to Medusa's release cycle.
- **−** New auth, new deploy, more infra to run and secure.

### Option C — Buy, don't build: Looker Studio
Google **Looker Studio** connects GA4 + GSC natively; embed the report.
- **+** Near-zero build, free, maintained by Google.
- **−** **No native Bing**; limited custom logic; another tool to manage; less "ours".

**My lean:** start with **A** (cohesive, secure, reuses infra). Keep C in mind as a
fast interim while A is built — it can cover GA4+GSC immediately.

---

## 4. Sketch of the build (Option A)

**Ingestion (don't call Google/Bing on every page load — quota + latency):**
- A **scheduled job** (daily) pulls GA4 + GSC + Bing for each property and upserts into a
  cache table. GSC's 2–3 day lag means we re-pull a trailing window (e.g. last 30 days) each run.

**Data model (rough):**
```
seo_metric_daily(
  id, brand, source ENUM(ga4|gsc|bing), date,
  metric_type,           -- users | new_users | sessions | clicks | impressions | ctr | position
  value,                 -- numeric
  created_at, updated_at
)
seo_query_daily(         -- GSC/Bing top queries
  id, brand, source, date, query, page,
  clicks, impressions, ctr, position
)
seo_page_daily( ... )    -- top landing pages
```
Keeps the UI fast (reads from our DB) and gives us history beyond GSC's 16-month window.

**API routes (admin):**
- `GET /admin/seo/overview?brand=&from=&to=` → KPIs + deltas
- `GET /admin/seo/queries?brand=&from=&to=&page=` → top queries
- `GET /admin/seo/pages?brand=&from=&to=` → top pages
- `POST /admin/seo/refresh` → trigger an on-demand pull

**UI:** an admin page with a brand switcher, date-range picker, KPI cards, trend charts,
and sortable query/page tables.

---

## 5. Open decisions (let's resolve these)

1. **Build vs buy:** Option A (Medusa admin), B (standalone), or C (Looker Studio) — or C now + A later?
2. **Home for it:** inside `krile_medusa` admin, or a separate app?
3. **Brands:** confirm both properties exist and we can add a service account to each
   (GA4 + GSC) and get a Bing API key. Is Bing must-have v1, or nice-to-have later?
4. **History:** just mirror what the APIs give, or store our own daily snapshots to build
   long-term history (beyond GSC's 16 months)? (I lean: store our own.)
5. **Who uses it:** just you/admin, or client-facing too? Affects auth & polish.
6. **Refresh cadence:** daily job enough, or need on-demand refresh in the UI? (Both is easy.)
7. **Scope of v1:** which panels are must-have vs later (see §1)?
8. **Keyword Planner:** worth the Google Ads API friction (dev-token approval + Ads account, ranged volumes without spend)? Or use a paid 3rd-party for exact volumes? Or defer keyword research to a later phase?

---

## 6. Suggested phased plan (once decisions land)
- **Phase 0:** stand up Looker Studio for GA4+GSC (both brands) — value in a day, baseline while we build.
- **Phase 1:** `seoMetrics` module + daily ingestion job (GA4 + GSC) + overview KPIs admin page.
- **Phase 2:** query & page tables, trend charts, period-over-period deltas.
- **Phase 3:** Bing, "movers", index/crawl coverage.

---

## Notes / parking lot
- Service-account setup steps (GA4 Viewer, GSC user, Bing key) — document once chosen.
- Quotas: GA4 Data API and GSC both have per-day token limits; the cache table avoids hitting them from the UI.
- Ties back to the SEO fixes: add an annotation/marker for "deploy date" so we can see before/after.
