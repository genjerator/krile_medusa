# Company Outreach System — Design & Build Spec

> **Status:** Draft / discussion · **Owner:** backend/marketing · **Last updated:** 2026-10-10
> Living document — update as the build progresses. Keep decisions and open
> questions current; check off build steps as they land.

## 1. Goal

Bring the scraped German business listings from the **`krile`** project (a Go
scraper, local Postgres DB `krile`) into **Medusa**, so we can:

1. **Browse & filter** all companies in the Medusa admin — by city, name, email,
   website.
2. **Store personalized cold-outreach emails** (already crafted in `krile`) next
   to each company, and **send them from Medusa**.
3. **Promote the data to prod** — schema via migration, **data via raw SQL** for
   now.

This is a **separate channel** from the existing **SES campaign system**
(`sesEmails` / `customer_campaign` / `marketing_profile`, see
[`ses-campaign-email-system.md`](./ses-campaign-email-system.md)). That system
targets **real Medusa customers** with engagement tracking. Outreach targets
**scraped B2B leads** that are *not* customers. The two must not share tables.

## 2. Source data (krile, local Postgres `krile`)

Measured 2026-10-10.

### `companies` — 79,938 rows (52,741 with email, 7,958 cities)

| Column | Type | Notes |
|---|---|---|
| `id` | serial int | krile PK |
| `name` | text | NOT NULL |
| `category` | text | e.g. "Hotel", "Metzgerei" |
| `street`, `postal_code`, `city` | text | address |
| `phone`, `website`, `email` | text | contact |
| `source_url` | text | gelbeseiten listing URL, NOT NULL |
| `scraped_at` | timestamp | |
| `website_status`, `website_http_code`, `website_detail`, `website_checked_at` | text/int/tz | reachability probe |

### `company_emails` — 16 rows so far (generation in progress)

One or more crafted emails per company (`company_id` FK, `ON DELETE CASCADE`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | krile PK |
| `company_id` | int | FK → companies.id |
| `relevant_products` | text | e.g. "Vacuum machines (compact); Vacuum bags" |
| `reasoning` | text | why this lead / product fit |
| `subject` | text | email subject |
| `email_body` | text | **prebuilt HTML**, links to planetaindustries.de |
| `email_status`, `email_sent_at`, `email_error` | text/tz/text | send bookkeeping |

The email bodies link to **planetaindustries.de** → these send from the
**`industries`** SMTP account (see §6).

## 3. Decisions (locked)

| Decision | Choice | Implication |
|---|---|---|
| **Import scope** | **Companies with an email only (~52,741)** | No-email rows can't be emailed; skip them on import. Still a large browse table → server-side pagination. |
| **Sender runtime** | **Medusa sends** | New send path in Medusa, **separate** from the SES campaign dispatcher and from `customer_campaign`. Reuses the Notification module + `smtp-notification` provider. |
| **Admin UI** | **Read-only browse + filter** | Table filterable by city / name / email / website; expand a row to read its generated email(s). No send buttons, no editing in the UI (v1). |
| **Send cadence** | **Small manual batches (10 at a time) to start** | Send script takes `--limit` (default small). Run by hand, watch results, repeat. No bulk dispatcher / rate-limiter needed yet; revisit only when scaling up. |
| **Module** | **New `outreach` module** | Fully separate from `sesEmails`, `customer_campaign`, `marketing`, `newsletter`. |
| **IDs** | **Medusa prefixed string PKs; keep krile ids as `external_id` (unique)** | `external_id` makes import idempotent and preserves the company→email join. |
| **Schema → prod** | **Hand-written migration + `db:migrate`** | NEVER `db:generate` a module (drops core tables) and NEVER raw SQL DDL — tables only via migration files. |
| **Data → prod** | **Raw SQL `INSERT` dump, handed over as a full single-line SSH command** | Matches the prod workflow (no live changes without per-action approval; hand over the command). Dump uses `ON CONFLICT (external_id) DO NOTHING`. |
| **krile → local transfer** | **Export from krile → exec-script import** | Decoupled: krile writes JSON/CSV; Medusa reads the file. No cross-DB connection from Medusa. |

## 4. Architecture

```
  krile (Go, Postgres `krile`)                 Medusa (Postgres, shared core DB)
  ┌───────────────────────────┐                ┌──────────────────────────────────────┐
  │ companies (79,938)         │   export       │ outreach_company  (external_id = krile id) │
  │ company_emails (crafted)   │ ──JSON/CSV──▶  │ outreach_email    (external_id = krile uuid)│
  └───────────────────────────┘                │   linked: company ──< emails               │
                                                │                                            │
                                                │ Admin: /app/companies  (browse + filter)   │
                                                │   └▶ GET /admin/outreach/companies (paged) │
                                                │                                            │
                                                │ Send: src/scripts/send-outreach  (throttled)│
                                                │   └▶ Notification module (smtp-notification,│
                                                │        account="industries") ──▶ inbox      │
                                                └──────────────────────────────────────┘
                                                     │ local → prod: migration (db:migrate)
                                                     │ + raw SQL INSERT dump via SSH
                                                     ▼
                                                  prod Postgres (Strato VPS, docker compose)
```

## 5. Data model (`src/modules/outreach`)

Two models + a module link. Follows the `sesEmails` convention (hand-written
migration, `model.define`).

### `outreach_company`
```
id            model.id().primaryKey()        // comp_...
external_id   model.text().unique()          // krile companies.id (as string)
name          model.text()
category      model.text().nullable()
street        model.text().nullable()
postal_code   model.text().nullable()
city          model.text().nullable()
phone         model.text().nullable()
website       model.text().nullable()
email         model.text()                   // import filters to non-empty
source_url    model.text().nullable()
scraped_at    model.dateTime().nullable()
website_status      model.text().nullable()
website_http_code   model.number().nullable()
website_detail      model.text().nullable()
website_checked_at  model.dateTime().nullable()
```

### `outreach_email`
```
id            model.id().primaryKey()        // oeml_...
external_id   model.text().unique()          // krile company_emails.id (uuid)
company_id    model.text()                   // FK-ish → outreach_company.id (via link)
to_email      model.text()                   // denormalized recipient
relevant_products model.text().nullable()
reasoning     model.text().nullable()
subject       model.text().nullable()
email_body    model.text().nullable()        // prebuilt HTML
status        model.text().default("pending")// pending|queued|sending|sent|failed|skipped
attempts      model.number().default(0)
sent_at       model.dateTime().nullable()
error         model.text().nullable()
generated_at  model.dateTime().nullable()
```

**Link:** `outreach_company` has many `outreach_email` (module link, like other
custom links in the repo).

**Indexes (in the migration):** `city`, `email`, `name`, `company_id`,
`status`. For name/email substring filters use `ILIKE '%q%'` (add a `pg_trgm`
GIN index later only if the table filter feels slow at ~50k rows).

## 6. Send flow (Medusa sends — separate from SES)

Triggered by an **exec script / scheduled job**, *not* the admin UI (admin is
read-only in v1).

1. Select `outreach_email` rows where `status = 'pending'` and the linked
   company has a non-empty email, **limited to a small batch** (`--limit`,
   default ~10). Run the script by hand per batch to start — no background
   dispatcher yet.
2. Send each via the **Notification module + `smtp-notification` provider**
   (the same mechanism as all other mail — see root `CLAUDE.md`):
   ```ts
   notificationModule.createNotifications({
     to: company.email,
     channel: "email",
     template: "outreach",
     data: { account: "industries", subject, html: email_body },
   })
   ```
   `account: "industries"` → Planeta Industries mailbox (`SMTP_INDUSTRIES_*`),
   matching the planetaindustries.de links in the bodies.
3. Update `status` → `sent` / `failed`, set `sent_at`, `attempts`, `error`.
   **Best-effort:** a send failure marks the row, never throws.

> **Deliberately NOT reused from the SES system:** `ses_emails` outbox,
> `customer_campaign` tracking, SES→SNS event webhook, `marketing_profile`
> unsubscribe. Outreach is a standalone path. Open-click tracking and
> unsubscribe handling are **open questions** (§9) — resolve before any real
> bulk send.

## 7. Import flow (krile → local Medusa)

1. **Export from krile** — add a krile command, or a one-off `psql \copy`, that
   writes two files (companies-with-email, and their `company_emails`) as JSON or
   CSV into a shared path.
   *(Built — the current script reads the krile DB directly via `psql`, so no
   intermediate file is needed locally. The export route stays the documented
   path for prod.)*
2. **Import exec script** `src/scripts/import-outreach-companies.ts`:
   - Reads the export files.
   - **Skips companies with empty email.**
   - Upserts `outreach_company` by `external_id` (create-or-update), in batches.
   - Upserts `outreach_email` by `external_id`, resolving `company_id` via the
     parent's `external_id`; sets `to_email` from the company email.
   - Idempotent: re-running after a fresh scrape updates in place.
   - Run locally (medusa exec args are POSITIONAL — no dashes):
     `pnpm medusa exec ./src/scripts/import-outreach-companies.ts` (all ~52k), or
     `… import-outreach-companies.ts limit=100` for a test run.
   - Krile DB connection overridable via `KRILE_DB_HOST/PORT/NAME/USER/PASSWORD`
     (defaults to local `krile`; local auth needs no password).

> **⚠️ Migration naming gotcha (learned the hard way):** Medusa shares ONE
> `mikro_orm_migrations` table across all modules and matches migrations by CLASS
> NAME. A new migration whose name duplicates an existing one (e.g. marketing
> already had `Migration20261010120000`) is silently **baselined** — recorded as
> applied, `up()` never runs, no table, no error. Always give a module migration a
> timestamp unique across the whole repo. (`outreach` uses `Migration20261010160000`.)

## 8. Prod promotion

1. **Schema:** commit the migration, deploy code, run `db:migrate` on prod — as a
   full single-line SSH command handed over (not run from here without approval).
2. **Data:** generate an `INSERT` dump locally (a script emitting
   `INSERT ... ON CONFLICT (external_id) DO NOTHING`, or `pg_dump --data-only
   --table=outreach_company --table=outreach_email`).
3. Hand over a **single-line SSH command** that pipes the dump into the prod
   Postgres container. Outreach tables are separate from campaign tables, so this
   never touches `ses_*` / `customer_campaign` / core data.

## 9. Admin UI

- Page: `src/admin/routes/companies/` (custom admin route) — shows under a nav
  entry. Follows the admin-dashboard customization patterns.
- Backend: `GET /admin/outreach/companies` — **server-side** pagination + filter
  params: `city`, `q` (name OR email `ILIKE`), `has_website`, `has_email`.
- Row expand / drawer: read the company's `outreach_email` row(s) — subject,
  reasoning, relevant products, status.
- **Read-only** in v1.

## 10. Open questions / risks

- **⚠️ Legal (biggest):** unsolicited B2B cold email in Germany is restricted
  under **UWG §7** — generally needs prior consent even B2B. Decide the
  compliance stance (existing-contact exemption? opt-out footer? volume caps?)
  **before** any real send. Document the decision here.
- **Unsubscribe / List-Unsubscribe header** — required for bulk sending and good
  hygiene. Build a minimal opt-out even if we don't reuse `marketing_profile`.
- **Open/click tracking** — none in v1, or reuse an SES config-set? Decide.
- **Multiple emails per company** — model supports it; confirm the send policy
  (one per company? latest only?).
- **Dead websites** — `website_status` lets us skip unreachable sites; filter on
  import or just expose in the table?
- **Volume / throttling** — not a v1 concern: sending goes out in **small manual
  batches (~10 at a time)**. A rate-limited dispatcher + SMTP sending-limit checks
  are only needed if/when we scale toward the full ~50k.

## 11. Build checklist

- [x] `src/modules/outreach` — `index.ts`, `service.ts`, `outreach_company` model.
      *(The `outreach_email` model + module link are still TODO.)*
- [x] Hand-written migration (`Migration20261010160000`, `CREATE TABLE IF NOT
      EXISTS` + indexes on city/email/name). Registered in `medusa-config.ts`.
- [x] `src/scripts/import-outreach-companies.ts` (idempotent, batched, email-only,
      `limit=N`). **All 52,741 companies imported locally.**
- [ ] `outreach_email` model + migration + import of `company_emails`.
- [x] `GET /admin/outreach/companies` list route — paged + filters (`q` over
      name/email/website, `city` ILIKE, `has_website` yes/no).
- [x] Admin page `src/admin/routes/companies/` — read-only DataTable, server-side
      pagination, search + city filter + website toggle. Nav entry "Companies".
- [ ] `src/scripts/send-outreach.ts` (throttled, Notification module, industries
      account, status bookkeeping).
- [ ] Resolve §10 compliance + unsubscribe before first real send.
- [ ] Prod: `db:migrate` command + raw SQL data dump command (handed over).
```
