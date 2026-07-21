# Weekly Action — Extension Design

A Medusa extension for running **weekly product promotions** ("Weekly Action").
The merchant plans a **whole year of campaigns ahead** — roughly 52 of them, one
per week — selecting products and lowering their price (by percentage or to a
fixed amount). Each week's campaign drives **three consistent outputs**:

1. **Live sale prices** in the shop (cart + checkout included), auto-rolling over
   week to week by date
2. A **`/weekly-action` storefront page** listing the current week's products
3. A **Brevo-ready HTML email** (preview + export now; a recurring Monday send via
   the Brevo API is a planned later phase)

The end goal: plan the full year up front, let prices roll over automatically each
week, and send the current week's campaign to a customer list every Monday (via
Brevo). Today we build everything up to and including manual Brevo export; the
automated Monday send is a designed-for, deferred phase.

> Built on Medusa **2.13.6**. Backend repo: `krile_medusa`. Storefronts:
> `krile_medusa-storefront` (Planeta Industries) and
> `planetagmbh_medusa-storefront` (Planeta GmbH).

---

## Key insight: most of the "was/now" UI already exists

Medusa has a native **Price List** feature, and the storefront starter **already
renders the "was 20€ / now 16€" UI**. See
`krile_medusa-storefront/src/modules/products/components/product-price/index.tsx`
and `.../product-preview/price.tsx`: when a variant's price comes from a sale
price list, `price_type === "sale"` and it shows the struck-through original price
+ a `-X%` badge automatically.

So we do **not** build a custom pricing engine. We build a thin layer that
**orchestrates a native Price List**, keeping Medusa's battle-tested cart/checkout
pricing intact.

### What a native Price List gives us for free
- Pick specific products/variants and set an override price
- `type: "sale"` → triggers the strikethrough UI above
- `starts_at` / `ends_at` → the weekly window auto-activates and auto-expires
- Cart + checkout pick up the sale price with **zero checkout changes**

### What's genuinely missing (the work we add)
- **Percentage discounts** — Price Lists store *absolute amounts*, not "20% off".
  So a percentage must be computed (`base × (1 − value/100)`) per variant. We
  **store the rule** so prices can be recomputed if the base price changes.
- **A "products on sale" set** for the listing page — a Price List has no clean
  storefront query for this. Solved via a custom module + module link to products.
- **A single admin form** unifying "pick products → pick discount → pick dates".

---

## Decisions locked in this discussion

| Topic | Decision |
| --- | --- |
| Planning horizon | **A full year ahead** — ~52 campaigns, one per (non-overlapping) week |
| Discount type | **Percentage *and* fixed**, with the **rule stored per item** so sale prices can be recomputed |
| Identifying the product set | **Custom module + module link to Product** (precise, structured) |
| Concurrency | **Date-driven, not manual** — exactly one campaign is "current" at any moment (the week whose window covers `now`); non-overlapping week windows enforced |
| Price strategy | **Pre-create all 52 Price Lists** up front with future date windows; Medusa auto-applies the current week. A resync workflow refreshes them if base prices change |
| Email send | **Brevo** owns list, sending, and unsubscribe — we only **produce Brevo-ready HTML** |
| Brevo handoff | **Manual export for now** (copy/download HTML, paste into Brevo). The recurring **Monday auto-send via Brevo API is a deferred phase** (designed-for, not built) |
| Customer list | **Managed in Brevo** — the extension targets a Brevo list ID; no subscriber sync built |

### Open questions (to confirm before/at build time)
- **One brand or both?** Does a campaign need a brand / sales-channel field now
  (Planeta Industries vs Planeta GmbH), which also selects the email identity /
  Brevo list?
- **Phasing** — build all at once, or stop after Phase A (backend + admin CRUD)
  for review before the storefront page and email.

---

## Architecture: one campaign → three outputs

```
                    ┌─────────────────────────┐
                    │   WeeklyAction (campaign) │
                    │   + WeeklyActionItem[]    │  ← stored rule (pct/fixed)
                    └─────────────┬───────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                        ▼
  native Price List        /weekly-action page      Brevo-ready HTML
  (type: "sale")           (reuses ProductPreview)   (+ structured payload)
  → live prices,           → was/now renders          → preview + export
    cart + checkout           for free                   (API push later)
```

The render layer emits **both** the filled HTML **and** a structured payload
(products, prices, image URLs, links) so a future Brevo API integration can use
either, without rework.

---

## Data model

### `WeeklyAction` (one per week)
- `title` — e.g. "KW26 Aktion"
- `iso_week` / `year` — the calendar slot (for the 52-week plan + uniqueness)
- `starts_at`, `ends_at` — the week window (mirrored onto the Price List). The
  "current" campaign is derived as the one whose window covers `now`; windows must
  **not overlap**.
- `default_discount_type` — `percentage | fixed` (pre-fills the form)
- `default_discount_value`
- `price_list_id` — the native Medusa Price List this campaign owns (pre-created)
- `status` — e.g. `draft | planned` (a week with no products stays a draft and is
  skipped). "Active/current" is **derived by date**, not stored.
- **Reserved for Brevo automation** (unused until then, avoids later migration):
  `brevo_campaign_id`, `brevo_template_id`, `brevo_synced_at`, `brevo_status`

### `WeeklyActionItem` (per-product rule)
- `weekly_action_id`
- `product_id`
- `discount_type` — `percentage | fixed`
- `discount_value` — **the stored rule** per product, so "20% off these four" and
  "this one exactly 16€" can coexist

### Module link
`WeeklyAction ↔ Product` (`src/links/`) for clean `query.graph` joins from the
storefront/email queries.

---

## Yearly schedule & weekly rollover

The merchant plans the year as ~52 `WeeklyAction` rows, each pinned to a calendar
week with non-overlapping `starts_at`/`ends_at`. An admin **"generate 52 weekly
slots"** helper scaffolds the empty weeks for a chosen year; the merchant then
fills products per week.

- **Which week is live** is **derived by date** — the campaign whose window covers
  `now`. No manual "activate" button and no `is_active` flag to keep in sync.
- **Rollover is automatic.** Because each week's Price List carries its own
  `starts_at`/`ends_at`, Medusa applies the correct week's sale prices on its own —
  no scheduled job needed for pricing.
- The `/weekly-action` page and the email both query "the current week's campaign".

## How pricing works (the important part)

Each campaign **owns a pre-created native Medusa Price List** of `type: "sale"`.
We build all 52 up front. A sync workflow does the real work per campaign:

1. Load campaign + items
2. For each product's variants, read base prices **per currency**
3. Compute the sale amount: percentage → `base × (1 − value/100)`; fixed → the
   fixed value (rounded to cents)
4. Create/update the Price List with the week's `starts_at` / `ends_at` and the
   computed per-variant prices

Because they're **real Price Lists** with date windows, cart and checkout pick up
the right week's sale price automatically, and the year rolls over with no job.

### Staleness — the one trade-off of pre-creating 52
Pre-computed amounts can go **stale if a base price changes** after a future
week's Price List was built. Because we **store the rule** (not just the amount),
a **resync workflow** recomputes any/all weeks on demand. Recommended safeguards:
- An admin **"Resync prices"** action (one week or the whole year)
- *Optional later* — a subscriber that auto-resyncs affected future weeks when a
  product/variant base price changes

### Trade-offs / build-time notes
- **Rounding** — percentage prices round to cents.
- **Currencies/regions** — prices compute per currency the variant has; the store
  is EUR-centric so this is light.

---

## Email layer → Brevo

Brevo owns the **list, sending, and unsubscribe**, so we do **not** build a
bulk-send workflow, SMTP throttling, recipient management, or a tokenized
unsubscribe route. Our job is to **produce Brevo-ready HTML**.

- New `src/lib/email-templates/weekly-action/` mirroring the existing
  `inquiry-confirmation/` folder:
  - `shared.ts` — base HTML shell (**table-based / inline-styled**, what email
    clients and Brevo's importer want) = the merchant's template
  - a repeatable **product-card block** per item: image, name, **was 20€ /
    now 16€**, product link
  - `de.ts` / `en.ts` copy, `types.ts`, `index.ts` →
    `getWeeklyActionEmail({ campaign, products, locale })` returning
    **HTML + structured payload**
  - footer carries **Brevo's unsubscribe variable** (exact token confirmed at
    build time) — Brevo resolves it on send
- It reuses the **exact prices the Price List sync computed**, so the email and
  the page always agree.
- **Admin: preview + Copy / Download HTML** for any week. You paste it into a Brevo
  campaign and send to your Brevo-managed customer list. That's the whole handoff
  today.

> The customer list is **managed in Brevo** — the extension does not sync
> subscribers. The newsletter module (`src/modules/newsletter`) and the
> `smtp-notification` provider stay for order/inquiry mail — they are **not** used
> for this feature.

### Future phase: recurring Monday auto-send via Brevo API (designed-for, not built)
The actual end goal. A Medusa **scheduled job** runs every Monday, picks the
current week's campaign, renders the HTML/payload, and uses the **Brevo API** to
create + send (or schedule) a campaign to the configured Brevo **list ID** — with
a double-send guard via the reserved `brevo_*` fields. The structured payload, the
`BREVO_API_KEY` env slot, and a `BREVO_LIST_ID` make this a clean add-on with no
rework. An admin "Push to Brevo now" button can ship alongside for manual triggers.

---

## Implementation plan

Build **A → B → C** now (each phase verifiable before the next). **Phase D**
(Monday auto-send) is deferred but designed-for.

### Phase A — Backend: calendar module + pricing
1. Module `src/modules/weekly-action/` — `models/weekly-action.ts` (week slot),
   `models/weekly-action-item.ts`, `service.ts`, `index.ts`
2. Module link `WeeklyAction ↔ Product` in `src/links/`
3. Migration (db-generate)
4. Workflow `sync-weekly-action-prices.ts` — rules → per-variant/per-currency
   amounts → create/update that week's sale Price List (with its date window)
5. Workflow `generate-weekly-slots.ts` — scaffold 52 (draft) week rows + their
   Price Lists for a chosen year; non-overlapping window validation
6. Workflow / action `resync-weekly-action-prices.ts` — recompute one week or all
   (handles base-price staleness)
7. Admin API `src/api/admin/weekly-actions/` — CRUD, `generate-year`, `resync`.
   *(No `activate` — "current" is derived by date.)*
8. Store API `src/api/store/weekly-action/route.ts` — the **current** week's
   products (window covers `now`) fetched **with pricing context**
   (`calculated_price` / `price_type: "sale"`)

### Phase B — Admin calendar UI + storefront page
9. Admin page: **year calendar view** of the 52 weeks, per-week edit form
   (products + per-item discount + dates), "Generate year" and "Resync" actions
10. `krile_medusa-storefront/src/app/[countryCode]/(main)/weekly-action/page.tsx`
    + a template mirroring `/store`, product list from the store route, reusing
    `ProductPreview` / `PreviewPrice` (was/now renders for free)

### Phase C — Brevo-ready email HTML
11. `src/lib/email-templates/weekly-action/` → `getWeeklyActionEmail()` returning
    HTML + structured payload; footer with Brevo unsubscribe variable
12. Admin **preview + Copy / Download** per week; reserve `brevo_*` fields +
    `BREVO_API_KEY` / `BREVO_LIST_ID` env for later API automation

### Phase D — Recurring Monday auto-send (deferred)
13. Medusa **scheduled job** (weekly, Monday) → current week's campaign → render →
    **Brevo API** create + send to `BREVO_LIST_ID`; double-send guard via
    `brevo_*` fields. Plus an admin "Push to Brevo now" manual trigger.

---

## Relevant existing code (reference)

- Sale UI already present:
  `krile_medusa-storefront/src/modules/products/components/product-price/index.tsx`,
  `.../product-preview/price.tsx`,
  `krile_medusa-storefront/src/lib/util/get-product-price.ts`
- Store listing to mirror:
  `krile_medusa-storefront/src/app/[countryCode]/(main)/store/page.tsx`
- Email template pattern to mirror:
  `src/lib/email-templates/inquiry-confirmation/`
- Email identity (brand → mailbox): `src/lib/store-email-identity.ts`
- Newsletter module (not used by this feature): `src/modules/newsletter/`
