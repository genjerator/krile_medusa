# Weekly Actions

Weekly Actions are **time-limited weekly product promotions** ("Wochenaktion").
A merchant plans campaigns ahead (up to a full year, one per ISO week), each
selecting a set of products and lowering their price. An activated campaign
produces three consistent outputs:

1. **Live sale prices** in the shop (product pages, cart, checkout) via a native
   Medusa **Price List**.
2. A **`/weekly-actions` storefront page** listing the current week's products.
3. A **ready-to-send HTML email** (the "Wochenaktion" newsletter) that can be
   previewed/exported per campaign.

> This document is the functional + technical reference. For the original design
> rationale (why a native Price List, phased plan, Brevo roadmap) see
> [weekly-actions-design.md](./weekly-actions-design.md).

---

## 1. Functional overview

### What the merchant does (Admin → Weekly Actions)

- **Plan a year** — "Generate year" creates ~52 draft weeks with correct ISO
  week numbers and Mon–Sun date windows.
- **Create one week** — "New weekly action" makes a single campaign for the
  current/next free week and opens it for editing.
- **Edit a campaign** (drawer): set the title, start/end dates, a default
  discount, and add products. Each product gets its own discount rule:
  - **Percentage** — e.g. `-20%` off the base price, or
  - **Fixed** — an exact new price (e.g. `16.00 €`).
- **Resync prices** — recomputes the campaign's sale Price List from the current
  base prices and rules (run it after a base price changes).
- **Go live** — a per-row **Live** switch activates the campaign. Activation is
  **manual and single**: turning one on turns the others off and makes its sale
  prices live immediately (no date-based auto-rollover today).
- **Generate email HTML** (drawer) — renders and **saves** the campaign's email
  file on the backend. Afterwards the list row shows a **Preview** button that
  opens the saved HTML in a new tab.

### What the shopper sees

- On product pages / listings / cart / checkout, discounted products show the
  native **"was 20 € / now 16 €"** UI with a `-X%` badge (driven by the sale
  Price List — no custom pricing code).
- The **`/weekly-actions`** page lists the currently active campaign's products.
- When there is no active campaign, the page and homepage section hide
  themselves.

### Statuses

| Field | Meaning |
|-------|---------|
| `status: draft` | No products / no price list yet. |
| `status: planned` | Has a sale Price List built and ready. |
| `is_active: true` | The single live campaign; its Price List is `active`. |

---

## 2. Technical architecture

### 2.1 Data model — `src/modules/weeklyAction/`

Module key: `WEEKLY_ACTION_MODULE = "weeklyAction"` (`index.ts`).

**`weekly_action`** (`models/weekly-action.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | id | PK |
| `title` | text | |
| `year`, `iso_week` | number | ISO week identity |
| `starts_at`, `ends_at` | dateTime | Mon–Sun window |
| `status` | enum `draft`\|`planned` | |
| `is_active` | boolean | single live campaign |
| `default_discount_type` | enum `percentage`\|`fixed` | applied to newly added items |
| `default_discount_value` | float, nullable | |
| `price_list_id` | text, nullable | the native sale Price List it manages |
| `brevo_*` | text/dateTime, nullable | reserved for the planned Brevo send |
| `items` | hasMany → `weekly_action_item` | |

**`weekly_action_item`** (`models/weekly-action-item.ts`)

| Field | Type | Notes |
|-------|------|-------|
| `product_id` | text | |
| `discount_type` | enum `percentage`\|`fixed` | per-product rule |
| `discount_value` | float | `20` = 20% off, or the fixed new price |
| `weekly_action` | belongsTo | |

Service: `WeeklyActionModuleService` (`service.ts`) — a thin `MedusaService`
over the two models.

### 2.2 Workflows — `src/workflows/weekly-action.ts`

| Workflow | Steps | Purpose |
|----------|-------|---------|
| `createWeeklyActionWorkflow` | create → sync prices | Create a campaign + build its Price List. |
| `updateWeeklyActionWorkflow` | update → sync prices | Edit a campaign (optionally replace items) + rebuild prices. |
| `deleteWeeklyActionWorkflow` | delete | Remove a campaign. |
| `resyncWeeklyActionPricesWorkflow` | sync prices | Recompute the Price List from stored rules. |
| `toggleWeeklyActionWorkflow` | toggle | Activate/deactivate (single active; makes prices live now). |
| `generateWeeklyActionYearWorkflow` | generate slots | Create the year's draft weeks. |

**Pricing** (`steps/sync-weekly-action-prices.ts`) is the core: it reads each
product's **base** prices (currency-only price rows, no region/group rules),
applies the item's discount (`base × (1 - pct/100)` or the fixed amount), and
recreates a native Price List of `type: "sale"`. The list is `active` while the
campaign `is_active`, otherwise `draft`. Prices are stored **as-is** (49.99 =
49.99, not cents).

### 2.3 API routes

**Admin** (`src/api/admin/weekly-actions/`)

| Method + path | Purpose |
|---------------|---------|
| `GET /admin/weekly-actions` | List campaigns. Also returns `email_generated: boolean` per row (whether a saved email file exists). |
| `POST /admin/weekly-actions` | Create. |
| `GET/POST/DELETE /admin/weekly-actions/:id` | Read / update / delete. |
| `POST /admin/weekly-actions/:id/toggle` | `{ active }` — go live / off. |
| `POST /admin/weekly-actions/:id/resync` | Recompute the sale Price List. |
| `POST /admin/weekly-actions/:id/email` | **Render + save** the email HTML to disk. |
| `GET  /admin/weekly-actions/:id/email` | Return the saved HTML (`{ exists, html, filename }`). |
| `POST /admin/weekly-actions/quick-create` | Create one week for the current/next free slot. |
| `POST /admin/weekly-actions/generate-year` | `{ year }` — create the year's weeks. |

**Store** (`src/api/store/weekly-action/route.ts`)

| Method + path | Purpose |
|---------------|---------|
| `GET /store/weekly-action` | The single active campaign + its `product_ids` (or `null`). The storefront then fetches those products through the normal pricing-aware product list so the sale Price List applies. |

### 2.4 Admin UI — `src/admin/routes/weekly-actions/page.tsx`

A custom UI route (`defineRouteConfig`, label "Weekly Actions"). Contains:
- The campaigns **table** (week, dates, status, Live switch, product count,
  discount, and per-row **Preview** button when `email_generated`).
- The **edit drawer**: title/dates/default-discount fields, a product search +
  per-item discount editor, and footer actions **Resync prices**,
  **Generate email HTML**, **Cancel**, **Save**.
- Data via the JS SDK (`sdk.client.fetch` for custom routes); mutations
  invalidate `["admin-weekly-actions"]` to refresh the list.

### 2.5 Storefront

- Data loaders: `src/lib/data/weekly-action.ts` — `getWeeklyAction()` and
  `getWeeklyActionProducts(countryCode)` (resolves region → active campaign →
  pricing-aware products).
- Page: `src/app/[countryCode]/(main)/weekly-actions/page.tsx`.
- Components: `src/modules/weekly-actions/*` and the homepage
  `weekly-action-section`.
- Present in **both** storefronts (`krile_medusa-storefront`,
  `planetagmbh_medusa-storefront`).

---

## 3. The email

### 3.1 Where the template lives

**The email HTML lives in separate template files with `{{placeholders}}`:**

```
src/lib/email-templates/weekly-action/templates/
├── email.html          # outer email shell — {{heading}}, {{validity}}, {{rows}}, …
├── product-row.html    # a row of two cards — {{left}} / {{right}}
└── product-card.html   # one product — {{link}} {{image}} {{title}} {{badge}} {{price}}
```

`render.ts` loads these files and fills the placeholders (prices, cards,
headings) — it holds the logic, the `.html` files hold the markup. Editing the
look/copy = edit the `.html`; no TS changes needed. `renderWeeklyActionEmail(data)`
is the single entry point, shared by both the admin button and the CLI. Files in
the folder:

| File | Role |
|------|------|
| `templates/*.html` | **The email markup** with `{{placeholders}}`. Edit these to change the design. |
| `render.ts` | Loads templates + fills placeholders (formatting, cards, prices). |
| `storage.ts` | On-disk location of generated files + `emailExists()`. |
| `generate.mts` | Standalone CLI generator (for the active week). |
| `wochenaktion.html` | Last CLI output (generated artifact). |

> **Build note:** `medusa build` transpiles `.ts`/copies `.mjs` but does **not**
> copy loose `.html`. Since the renderer reads the templates at runtime, a
> postbuild step (`scripts/copy-email-templates.mjs`, wired into `npm run build`)
> copies `templates/` into the compiled server output so the admin route finds
> them in the Docker image. `{{unsubscribe_url}}` in the footer is intentionally
> left un-filled for the ESP's merge tag.

Generated per-campaign files are written to (gitignored):

```
static/weekly-action-emails/weeklyaction{actionId}.html
```

### 3.2 Design

600px table-based layout, inline styles, Outlook (MSO) fallbacks, mobile
stacking. Brand blue `#1e3a5f`, red accents `#e11d48`, blue Planeta logo on a
white header (`https://www.planeta.de/planeta_logo_blue.png`), German copy. Each
product renders as an equal-height card with a cover-cropped image, a `-X%`
badge, struck-through original + red sale price, and a "Zum Produkt" button.
The footer keeps an `{{unsubscribe_url}}` placeholder for the ESP merge tag.

### 3.3 How to generate it

**A) Admin button (any specific campaign)**
Admin → Weekly Actions → open a week → **Generate email HTML** (drawer footer).
Saves `weeklyaction{id}.html`; then click **Preview** on the row to view it.
Prices come from the campaign's stored per-item discount rules (matches the
`resync` logic), so even a not-yet-live week renders correct was/now prices.

**B) CLI (the currently active campaign)**
From the `krile_medusa` repo, with the backend running:

```bash
npx tsx src/lib/email-templates/weekly-action/generate.mts
```

Writes `src/lib/email-templates/weekly-action/wochenaktion.html` for whichever
campaign is toggled active. It pulls data the same way the storefront does
(`/store/regions` → `/store/weekly-action` → `/store/products` with
`calculated_price`).

### 3.4 Configuration (env vars)

| Var | Used by | Default |
|-----|---------|---------|
| `WEEKLY_STOREFRONT_URL` (falls back to `STOREFRONT_URL` / `STORE_URL`) | product/CTA links | `https://www.planeta.de` |
| `WEEKLY_LOGO_URL` | header logo | `…/planeta_logo_blue.png` |
| `WEEKLY_EMAIL_CURRENCY` | admin route price selection | `eur` |
| `WEEKLY_BACKEND_URL` | CLI | `http://localhost:9000` |
| `WEEKLY_COUNTRY` | CLI (locale + region) | `de` |
| `WEEKLY_PUBLISHABLE_KEY` | CLI | read from the sibling storefront `.env.local` |
| `WEEKLY_OUT` | CLI | `./wochenaktion.html` |

---

## 4. Operational notes

- **Admin changes need a Docker rebuild.** The `medusa` service builds a
  production image (no source bind-mount), so new admin UI (buttons, routes)
  only appears after:
  ```bash
  docker-compose build medusa && docker-compose up -d medusa
  ```
  Then hard-refresh `http://localhost:9000/app` (the dashboard SPA caches
  aggressively).
- **Saved email files are a per-instance cache** on the backend filesystem
  (`static/weekly-action-emails/`), not durable or shared across instances, and
  cleared on redeploy. Regenerate anytime. (Could be moved to the File module /
  S3 for durability.)
- **Product images** in the email currently point at the raw S3 bucket URLs (the
  same ones the site uses).

---

## 5. Roadmap (not yet built)

- **Brevo integration** — the `weekly_action.brevo_*` fields are reserved for a
  recurring Monday send via the Brevo API (currently: manual preview/export
  only).
- **Date-based auto-rollover** — today activation is manual/single; automatic
  week-to-week rollover by date is a designed-for later phase.
