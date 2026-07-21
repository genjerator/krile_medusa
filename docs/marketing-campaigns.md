# Marketing: campaigns & customer priority

Normalizes email-campaign engagement into real tables and ranks every customer
by a marketing **priority**. Lives in the `marketing` module plus a few libs,
jobs, and scripts. Built on top of the existing Brevo sync/webhook — it does
**not** replace `customer.metadata.brevo` (that stays as-is for now).

## What it gives you

- **`customer_campaign`** — one row per (customer, campaign): which campaigns a
  customer was sent, and whether they opened / clicked / bounced.
- **`marketing_profile`** — one row per customer: an `unsubscribed` flag and a
  computed `priority` you can sort/segment on.

## Data model

### `customer_campaign`
One row per customer per campaign. A customer has many; each belongs to one customer.

| column | meaning |
|---|---|
| `customer_id` | the customer (plain column, not a module link) |
| `source` | provider — `brevo`, `mailgun`, … |
| `campaign_id` | the provider's external campaign id |
| `sent_at` / `opened_at` / `clicked_at` / `bounced_at` | when each event happened; `null` = didn't happen |

- Unique on **`(source, campaign_id, customer_id)`** → exactly one row per
  customer per campaign. Events are recorded **once** — an already-set timestamp
  is never overwritten (repeat opens/clicks don't add rows or change data).

### `marketing_profile`
One row per customer (1:1). The Medusa-idiomatic "extra columns on customer"
without touching the core `customer` table.

| column | meaning |
|---|---|
| `unsubscribed` | dedicated flag; when true it **suppresses** all other priority |
| `unsubscribed_at` | first time we saw them unsubscribed |
| `priority` | highest applicable tier (see below) |
| `priority_rank` | int mirror of `priority` for fast sorting (1 = highest, 99 = unsubscribed) |
| `last_opened_at` / `last_clicked_at` | reserved for future use |

## Priority

Each customer gets the **single highest** tier that applies:

| rank | priority | signal | source |
|---|---|---|---|
| 1 | `purchased` | has any order | `"order"` (by email) |
| 2 | `newsletter` | subscribed | `newsletter_preference` (by customer_id) |
| 3 | `reparatur` | sent a repair form | `reparatur` (by email) |
| 4 | `angebot` | requested an offer | `product_inquiry` (by email) |
| 5 | `clicked` | clicked an email | `customer_campaign.clicked_at` |
| 6 | `opened` | opened an email | `customer_campaign.opened_at` |
| 7 | `none` | no signal | — |
| 99 | `unsubscribed` | opted out | `metadata.brevo.unsubscribed` / `.blacklisted` |

**Unsubscribed suppresses everything:** an unsubscribed customer becomes
`priority = unsubscribed`, `priority_rank = 99`, even if they purchased.

Recomputed by a nightly job (`recompute-marketing-priority`, 03:00) as a single
set-based upsert across all customers. Note the order/reparatur/inquiry matches
are **by email** (that's how those forms relate to a customer in this project),
so casing is normalized with `lower()`.

## How the tables get populated

```
Brevo campaign event ──▶ /webhooks/brevo (marks contact dirty + logs)
                              │
                     sync-brevo-dirty job (every 5 min)
                              │  re-fetches the full Brevo contact
                              ▼
                     customer_campaign  ◀── upsert per campaign (sent/opened/clicked/bounced)
                              ▲
        backfill-customer-campaigns (one-time, from metadata.brevo.sent_campaign_ids)
```

- **Going forward:** the webhook marks a contact dirty; the 5-minute dirty-sync
  re-fetches that contact's per-campaign Brevo statistics and upserts
  `customer_campaign` rows. The webhook stays cheap (no per-event campaign
  writes on the hot path).
- **Backfill:** `backfill-customer-campaigns` moves the campaign ids already in
  `metadata.brevo.sent_campaign_ids` into rows (sent-only; open/click/bounce
  detail arrives from the sync feed).

## Jobs & scripts

| kind | name | schedule / how | does |
|---|---|---|---|
| job | `recompute-marketing-priority` | nightly 03:00 | recompute all priorities |
| job | `sync-brevo-dirty` (existing) | every 5 min | feeds `customer_campaign` from Brevo |
| script | `backfill-customer-campaigns` | manual | metadata → `customer_campaign` |
| script | `recompute-marketing-priority` | manual | on-demand priority recompute |

Run a script:
```
pnpm medusa exec ./src/scripts/backfill-customer-campaigns.js
pnpm medusa exec ./src/scripts/recompute-marketing-priority.js
```

## Querying

Top-priority customers first:
```sql
select mp.priority, mp.priority_rank, c.email, c.first_name, c.last_name
from marketing_profile mp
join customer c on c.id = mp.customer_id
where mp.deleted_at is null and mp.priority_rank < 99
order by mp.priority_rank asc, c.created_at desc;
```

Everyone who was sent campaign 5 but hasn't opened it:
```sql
select customer_id from customer_campaign
where source = 'brevo' and campaign_id = '5'
  and opened_at is null and deleted_at is null;
```

## Notes & limitations

- **`metadata.brevo` is kept.** The overview widget, CSV export, and aggregate
  stats still read it. These tables are additive for now.
- **Priority is stale between recomputes** (up to a day). Good enough for
  segmentation; run the script for an immediate refresh.
- **Clicked/bounce timestamps are approximate.** Brevo omits `eventTime` on some
  event types, so we record the observation time — the NOT-NULL presence is what
  the tiers use, not the exact instant.
- **Signals match by email** for orders/reparatur/inquiry; newsletter and
  campaigns match by `customer_id`. If email casing/aliases matter, revisit.
- **Migrations are hand-written** (`Migration20260721120000`) and applied by
  `medusa db:migrate` — never `db:generate` (it drops core tables on this shared DB).
