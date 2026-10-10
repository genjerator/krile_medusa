# SES Campaign Email System — Design & Build Spec

> **Status:** Draft / in progress · **Owner:** marketing/backend · **Last updated:** 2026-10-01
> Living document — we keep improving it as the build progresses. Check off steps
> as they land; keep decisions and open questions current.

## 1. Goal

Add an in-house campaign channel built on **AWS SES** that runs **alongside Brevo
(not instead of it)** — you choose per campaign which to use — and **track every
email** (sent / delivered / opened / clicked / bounced / complained /
unsubscribed) from both channels inside the **Medusa admin**. For SES, Medusa
*authors, sends, and tracks* campaigns; for Brevo it keeps ingesting events as it
does today. Both channels coexist indefinitely.

## 2. Decisions (locked)

| Decision | Choice | Implication |
|---|---|---|
| Brevo | **Keep — coexist** | SES is a *second* channel, not a replacement. Both selectable per campaign; Brevo webhook/sync stay untouched. `source` column discriminates. |
| Audience | **Medusa customers only** | Reuse `customer` + customer groups + `marketing_profile`. No external contacts table. |
| Email authoring | **Reuse `lib/email-templates`** | Campaign stores `template_key` + `data`; render HTML at send/preview time. |
| Volume | **1k–50k per campaign** | Needs SES production access + quota bump; throttled async sender; shared IP ok with good hygiene. |
| Sender runtime | **Medusa** (not a separate Go service) | One source of truth + one templating path. Redis-worker / scheduled-job dispatcher. |
| Event transport | **SES → SNS → HTTPS** | Webhook handles SNS `SubscriptionConfirmation` + signature verification. |
| Admin UI | **Medusa admin extension at `/app/prototype-email-campaign`** | Built as `src/admin/routes/prototype-email-campaign/` — shares Medusa login/SDK/auth natively (no separate app, no extra auth, no CORS). Rendered inside the admin shell; can be a full-width custom section. Backend `/admin/email-campaigns/*` (NOTE: `/admin/campaigns` is reserved by Medusa core Promotions — do not use it). |

## 3. Architecture

```
            ┌───────────────────────── Medusa ─────────────────────────┐
 Admin UI ─▶│ Campaign (compose, audience, schedule)                    │
            │   └▶ Launch workflow → render HTML → write customer_campaign (queued)
            │        └▶ Dispatcher (throttled) ──SES SendEmail──▶ AWS SES ──▶ inbox
            │                                   (campaign_id tag, List-Unsubscribe)
            │ /webhooks/ses  ◀─── SNS ◀─── SES config-set events (open/click/bounce…)
            │   └▶ update customer_campaign + marketing_profile + ses_event_log
            │ /unsubscribe   ◀─── recipient click / one-click POST
            │   └▶ marketing_profile.unsubscribed = true
            └───────────────────────────────────────────────────────────┘
```

Follows Medusa's **Module → Workflow → API Route → Admin** layering. Mutations go
through workflows; routes stay thin. Migrations are **hand-written** (never
`db:generate` on the shared DB — it drops core tables).

## 4. Data model

**Reuse (already built) — note the schema is already multi-provider:**
- `marketing.customer_campaign` — one row per (customer, campaign, **source**).
  The per-email tracking table. Brevo rows use `source = "brevo"`; SES rows use
  `source = "ses"`. Both live side by side; admin tracking unifies them by source.
- `marketing.marketing_profile` — 1:1 per customer: `unsubscribed`, priority,
  and **`user_type`** (free-text classification for targeting/testing — e.g.
  `test`, `bought_once`, `bought_multiple`, `opened_brevo`, `opened_ses`;
  `Migration20261001122000`). Set it with `src/scripts/set-user-type.ts <email> <type>`.
  **Shared across both channels** — one unsubscribe suppresses the customer for
  Brevo *and* SES (see §7).
- `brevoWebhookLog.brevo_webhook_log` stays for Brevo; **clone the pattern** as a
  separate `ses_event_log` for SES (don't mix providers in one table).

**Deltas to `customer_campaign` (hand-written ALTER, `IF NOT EXISTS`):**
- `ses_message_id` text (indexed) — SES message id, set by the sender; precise event match key.
- `delivered_at` timestamptz
- `complained_at` timestamptz
- `unsubscribed_at` timestamptz

**New module `sesEventLog` → table `ses_event_log`:**
`id, event, email, message_id, campaign_id, link, matched, payload (jsonb), created_at…`
— durable raw audit of every received SES/SNS event (mirrors `brevo_webhook_log`).
**Per-link click tracking (2026-10-09):** `link` holds the clicked URL from a Click
event (`event.click.link`), extracted in `recordSesEvent` (`Migration20261009120000`
added the column + indexes and backfilled historical Click rows from `payload`).
Reported by `GET /admin/ses-link-clicks?campaign_id=<source_id>` — each URL with
total clicks + distinct recipients (treat raw clicks as directional, `unique` as the
honest signal — scanners/Apple MPP inflate clicks, R3). Shown in the admin page's
**Link-Klicks** section for the selected weekly action.

**Audience = customer list = native Medusa customer group (decided 2026-10-09):**
A "customer list" is just a **native `customer_group`** (`customer_group` /
`customer_group_customer`) — no new table. This reuses Medusa's built-in admin
(Customers → Groups) for **manual** membership, plus APIs. Two ways to fill a list:
- **Manual** — native admin group membership (zero custom code).
- **By rule** — `POST /admin/customer-lists/from-segment { name, rule }` (and the CLI
  twin `src/scripts/build-customer-list.ts`) snapshot the customers matching a rule
  (`clicked | opened | buyer | rest | all | user_type:<x>`) into a group. Idempotent
  (adds only new matches, never removes). The rule SQL is shared with
  `seed-campaign-batches.ts` via `src/lib/ses/segment-audience.ts` (`resolveSegment`).

`GET /admin/customer-lists` lists the groups with live `members / eligible /
unsubscribed / no_email` counts. A send batch is generated per list via
`POST /admin/ses-emails/generate { source_id, group_id }` → a `ses_batch` with
`audience = "group:<customer_group_id>"` (re-generating **replaces** that group's
batch). `GET /admin/ses-batches?audience=groups` (or `group:<id>`) lists these and
resolves the group **name**. The admin page's **Kundenlisten** section is the primary
send flow; the per-batch send route + outbox are reused unchanged. (The `ramp`
engagement-tier batching still exists but is secondary.)

**New module `sesEmails` → table `ses_emails` (the OUTBOX — distinct from the
`customer_campaign` tracking table):**
`id, batch_id, source_type, source_id, customer_id, to_email, data (jsonb, nullable),
status, ses_message_id, error, attempts, generated_at, sent_at, created_at…`
- **Ref-based, no stored HTML.** A row is a per-recipient *intent to send* that
  points at a template (`source_type`/`source_id`, e.g. `weekly_action` + id). The
  email is **rendered at send time** (`buildWeeklyActionEmail`), so content reflects
  the template when sent. The merchant keeps it fresh by **re-generating** (which
  **replaces** that `batch_id`'s rows).
- `status`: `pending → queued → sending → sent` / `failed` / `skipped` (unsubscribed).
- `source_id` doubles as the SES `campaign_id` tag; on send, `ses_message_id` links
  the row to `customer_campaign` so opens/clicks/bounces attach.
- Outbox (`ses_emails`) = what to send; tracking (`customer_campaign`) = what happened.

## 5. Event → row matching strategy

SES events carry `mail.messageId`, recipient email, and (if the sender set them)
**message tags** including `campaign_id`. Match in priority order:
1. **`ses_message_id`** on a `customer_campaign` row (most precise; available once the sender stores it).
2. else **(source=`ses`, campaign_id tag, customer_id via email)** → `upsertCustomerCampaign` (fills missing timestamps, never overwrites).
3. else (no campaign context) → write `ses_event_log` + update profile-level `last_opened_at`/`last_clicked_at` only.

Bounce (hard) / Complaint → set `bounced_at`/`complained_at` **and** suppress:
`marketing_profile.unsubscribed = true` (protects sender reputation).

## 6. Components & build steps

### A. Event ingestion routes  ← current work
- [ ] Model delta: add `ses_message_id`, `delivered_at`, `complained_at`, `unsubscribed_at` to `customer-campaign.ts` model.
- [ ] Migration: hand-written `ALTER TABLE customer_campaign ADD COLUMN IF NOT EXISTS …` + index on `ses_message_id`.
- [ ] `sesEventLog` module (index/service/model/migration) + register in `medusa-config.ts`.
- [ ] `lib/sns.ts`: SNS envelope handling — auto-confirm `SubscriptionConfirmation` (validate `SubscribeURL` host is `*.amazonaws.com`), verify message **signature** (cached cert, SignatureVersion 1/2).
- [ ] `lib/ses-events.ts`: parse `eventType` (Open/Click/Bounce/Complaint/Delivery), resolve email→customer, apply matching strategy (§5), write log.
- [ ] `lib/unsubscribe-token.ts`: HMAC-signed token encoding `customer_id` (+ optional `campaign_id`); `sign()` / `verify()`.
- [ ] `POST /webhooks/ses` route — thin; always returns 200; delegates to libs.
- [ ] `GET /unsubscribe?token=…` — performs unsubscribe, returns a minimal HTML confirmation page (public: **not** under `/store`, so no publishable-key requirement).
- [ ] `POST /unsubscribe` — RFC 8058 one-click (`List-Unsubscribe-Post`); same effect, 200.
- [ ] `middlewares.ts`: `sesWebhookAuth` (shared `?token=` gate, like Brevo) on `/webhooks/ses`.
- [ ] Env: `SES_WEBHOOK_TOKEN`, `MARKETING_UNSUBSCRIBE_SECRET`, `UNSUBSCRIBE_BASE_URL`.
- [ ] Verify locally (simulate SNS `SubscriptionConfirmation` + `Notification` payloads).

### B. Sender (later)
- [ ] `Campaign` model (extend `marketing`): name, subject, from-identity, `template_key`, `data`, status, `scheduled_at`, `sent_at`, aggregate counts.
- [ ] Audience resolution from customers/groups/`marketing_profile`, minus suppressed/unsubscribed.
- [ ] Launch workflow: render HTML (reuse `lib/email-templates`) → bulk-insert `customer_campaign` rows as `queued` (chunked for 50k).
- [ ] Throttled dispatcher (scheduled job or Redis worker) → SES `SendEmail` at ≤ SES TPS; store `ses_message_id`; retries; idempotent/resumable (only `queued`).
- [ ] Attach **`campaign_id` message tag** + **`List-Unsubscribe`** / `List-Unsubscribe-Post` headers (points at `/unsubscribe` signed token).
- [ ] Send-test + scheduling.

### C. Admin UI (later)
- [ ] Campaigns list (status + open/click/bounce rates).
- [ ] Campaign editor (template + fields, audience picker, preview, test send, schedule/send).
- [ ] Per-campaign recipients table — per-email status + event timeline ("track every email").
- [ ] Suppression / unsubscribed list view.

### D. AWS infra
- [x] SES set up (domain, sending). *(per user)*
- [ ] Configuration set with **open/click tracking** + event destination → **SNS topic**.
- [ ] SNS HTTPS subscription → `https://admin.planetaindustries.de/webhooks/ses?token=…`.
- [ ] SES **production access** + sending-rate quota increase for 1k–50k.
- [ ] DKIM / SPF / DMARC confirmed on the sending domain.

## 7. Compliance (GDPR / DE)

- Every campaign email **must** carry an unsubscribe link + `List-Unsubscribe` one-click header. ✅ Implemented in `sendCampaignEmail`: per recipient it fills the body `{{unsubscribe_url}}` placeholder **and** sets `List-Unsubscribe` / `List-Unsubscribe-Post`, both pointing at `/unsubscribe?token=<signed>`.
- Hard bounce / complaint → immediate suppression (SES account suppression list + `marketing_profile`).
- Consent: define opt-in model (see open questions). Honour `unsubscribed` everywhere audiences are resolved.
- **🔒 Send-time suppression guarantee (non-negotiable):** NO `ses_emails` row is ever
  sent without an immediately-preceding `marketing_profile.unsubscribed = false`
  check for that customer. There is ONE send function (used by both the manual
  button and the queue job); its first step per recipient re-reads `unsubscribed`
  and, if true, sets the row `skipped` and does **not** send — inside the same claim
  that flips the row to `sending`, so a concurrent unsubscribe/double-run can't slip
  through. Generate-time filtering is only an optimization; the send-time check is
  the actual guarantee (covers anyone who unsubscribed between generate and send).
- **Cross-channel unsubscribe** (both channels live): `marketing_profile.unsubscribed`
  is the single source of truth. An unsubscribe from *either* channel must suppress
  the customer in *both*. SES audience resolution reads the flag directly; for Brevo,
  propagate the unsubscribe to Brevo (contact update / blocklist) so Brevo campaigns
  also stop — otherwise a customer who opted out via SES still gets Brevo mail.
- Seed `marketing_profile` from Brevo's current unsubscribe/suppression list so SES
  never emails someone who already opted out of Brevo.

## 8. Open questions / pending decisions

- **Dispatcher mechanism:** Medusa scheduled job (simplest, batch/min) vs Redis/BullMQ worker (smoother pacing). *Leaning: scheduled job for ≤50k.*
- **From-identity per campaign:** always Planeta Industries, or selectable industries/planeta via `store-email-identity`?
- **Consent model:** treat "not `unsubscribed`" as consent, or require explicit opt-in flag carried over from Brevo?
- **Cross-channel unsubscribe propagation:** when a customer unsubscribes via SES, do we push that to Brevo immediately (API call) or on a sync job? (And vice-versa — Brevo unsubscribe already flows in via its webhook.)
- **Channel per campaign:** how the admin picks Brevo vs SES when creating a campaign (and whether some audiences are channel-specific).

## 9. Conventions to respect

> **Build note:** new API routes compile and register normally (verified). A transient stale build state on 2026-10-01 made new routes briefly not appear; it cleared with `rm -rf .medusa node_modules/.cache` + rebuild. There is NO persistent freeze — add clean routes as usual. (The test-recipients endpoint currently rides on `GET /admin/custom?view=test-recipients` from that episode; it can be migrated to a proper `/admin/email-campaigns/*` route.) Gotcha: an unauthenticated `/admin/*` request returns 401 even for a missing route (auth middleware runs first) — confirm registration via the compiled file, not an unauth curl.


- Hand-written migrations only; **never** `medusa db:generate <module>` on the shared DB.
- Webhooks under `api/webhooks/<provider>`; `?token=` gate in `middlewares.ts`.
- Mutations via workflows; routes thin; `query.graph()` for reads.
- Best-effort webhooks: always return 200 so SNS/SES don't retry-storm; reconcile out of band.

## 10. Risks & mitigations

| # | Risk | Impact | Mitigation (where it's handled) |
|---|---|---|---|
| R1 | **Two suppression sources of truth** — Brevo's contact list vs `marketing_profile` | Opt-out via SES still gets Brevo mail → complaints → shared-domain reputation damage | On any unsubscribe, propagate to Brevo (Phase 2 step 7). Seed `marketing_profile` from Brevo suppression (Phase 4). Both channels resolve audience against the flag. |
| R2 | **Same From-domain, split infra** (Brevo IPs/DKIM vs SES) + SPF 10-lookup limit | SPF silently breaks; reputation split; one sender drags the domain down | Send SES from a **dedicated subdomain** (`news.planetaindustries.de`); its own DKIM/SPF/DMARC; verify SPF lookup count (Phase 0). |
| R3 | **False opens/clicks & self-firing unsubscribe** — Apple MPP inflates opens; security scanners auto-visit links incl. unsubscribe | Bogus engagement stats; customers silently unsubscribed | Never trust opens as truth in audience logic. **GET `/unsubscribe` shows a confirm button, does not act**; only explicit confirm or RFC-8058 one-click POST acts (Phase 1 step 7). |
| R4 | **No SES reconciliation** — a dropped SNS event is gone (unlike Brevo's re-poll) | Permanent tracking gaps on handler error | **Write raw event to `ses_event_log` FIRST, then match** — always reprocessable from the log (Phase 1 step 4). |
| R5 | **Dispatcher double-send** on crash/overlap during a ~1h 50k blast | Duplicate emails, complaints | State machine `queued → sending → sent/failed` + claim via `SELECT … FOR UPDATE SKIP LOCKED`; idempotent (never re-send `sent`) (Phase 2 step 5). |
| R6 | **GDPR/TTDSG (DE) consent for tracking** — open/click tracking is personal-data processing | Legal exposure | Legal review before enabling engagement tracking; consent may need to be separate from send consent (Phase 4 step 1). |
| R7 | `ses_event_log` growth (50k × many events, MPP multiplies opens) | Table bloat | Mirror `pruneBrevoWebhookLog` retention job (Phase 1 step 10). |
| R8 | **Multi-brand** — industries + planeta are different domains | Missing identities/config sets per brand | Verify SES identity + config set per brand domain (Phase 0). |
| R9 | SES open-tracking rewrites body links via `awstrack.me` | Branding/deliverability | Optional custom tracking domain on the config set (Phase 0). |

## 11. Build sequence (how to build it, in order)

Dependency order: **Phase 0 infra** and **Phase 1 routes** interlock (the SNS
subscription in Phase 0 needs the Phase 1 endpoint to exist). Build Phase 1 code,
then wire Phase 0's subscription to it, then Phase 2+.

### Phase 0 — AWS & domain foundation

> **Provisioned resources** (account `313003894447`, region `eu-central-1`):
> - SNS topic: `arn:aws:sns:eu-central-1:313003894447:ses-campaign-events` ✅ created
> - Topic policy: SES (`ses.amazonaws.com`) allowed to publish, scoped to account `313003894447` ✅ set
> - SES configuration set: `campaign-tracking` → event destination `sns-dest` (SEND/DELIVERY/OPEN/CLICK/BOUNCE/COMPLAINT/REJECT → topic) ✅ created. **Sender must send with `ConfigurationSetName: "campaign-tracking"`.**
> - SNS HTTPS subscription → `https://admin.planetaindustries.de/webhooks/ses` ✅ created & confirmed 2026-10-02; **tracking verified end-to-end** (send → SES → SNS → webhook → `ses_event_log` + `customer_campaign`).
> - ⏳ Remaining: SES **production access** (still sandbox — can only send to verified recipients) + quota; DKIM/SPF/DMARC on sending subdomain.

- [ ] Dedicated SES sending **subdomain** (`news.planetaindustries.de`) — isolate from Brevo + transactional (**R2**).
- [ ] Verify SES identity for the subdomain for **both brands** (industries + planeta); set DKIM + DMARC; confirm SPF stays < 10 lookups (**R2, R8**).
- [ ] SES **Configuration Set**: enable open/click tracking (+ optional custom tracking domain **R9**); add event destination → **SNS topic**.
- [ ] Request SES **production access** + sending-rate quota for 1k–50k.
- [ ] *(after Phase 1)* SNS **HTTPS subscription** → `https://admin.planetaindustries.de/webhooks/ses?token=…`.

### Phase 1 — Event ingestion routes  ✅ built & locally verified 2026-10-01 (Track A)
1. [x] Model delta + migration (`Migration20261001120000`): `customer_campaign` + `ses_message_id` (indexed), `delivered_at`, `complained_at`, `unsubscribed_at`.
2. [x] `sesEventLog` module (+ `Migration20261001121000`) registered in `medusa-config.ts`.
3. [x] `lib/ses/sns.ts` — auto-confirm `SubscriptionConfirmation` (host `*.amazonaws.com`) + signature verify (cached cert, SigVer 1/2; `SES_SNS_SKIP_VERIFY=true` disables for local).
4. [x] `lib/ses/ses-events.ts` — **log raw first (R4)**, map `eventType` → column, match per §5; Permanent bounce / complaint → suppress via `lib/ses/marketing-profile.ts`.
5. [x] `lib/ses/unsubscribe-token.ts` — HMAC sign/verify (no expiry). *(All SES lib logic lives in `src/lib/ses/`.)*
6. [x] `POST /webhooks/ses` — thin; always 200; handles text/plain (SNS) + json bodies.
7. [x] `GET /unsubscribe` (**confirm button, no auto-act — R3**) + `POST /unsubscribe` (human confirm + RFC-8058 one-click; token in `?token=`).
8. [x] `middlewares.ts` — `sesWebhookAuth` `?token=` gate on `/webhooks/ses`.
9. [ ] **Env to set in prod**: `SES_WEBHOOK_TOKEN`, `MARKETING_UNSUBSCRIBE_SECRET` (and `UNSUBSCRIBE_BASE_URL` for the sender later). *(verified locally via inline env)*
10. [x] `prune-ses-event-log` job (**R7**, daily 04:35).
11. [x] Verified locally (exec): Open→row, Click→same row by msgId, suppression, token round-trip + tamper-reject, raw logged. **Remaining: deploy, set env (#9), then SNS subscribe (Phase 0 Step 4) + a real SES test send.**

### Phase 2 — Sender (Track B)
> **Seeded so far:** `lib/ses/send.ts` → `sendCampaignEmail()` (SES SMTP + config set + `campaign_id` tag + one-click List-Unsubscribe). Single-recipient send working via two routes: `POST /admin/email-campaigns/test-email` and `POST /admin/weekly-actions/:id/send` (renders a weekly action via `lib/email-templates/weekly-action/build.ts` and records the send in `customer_campaign`).
**Outbox model (decided 2026-10-02):** a dedicated **`ses_emails`** outbox (§4) —
ref-based (template ref, no stored HTML), rendered at send time. Generate builds the
per-recipient `pending` rows for a template+group; re-generating **replaces** the
batch. This supersedes the earlier "queue rows into `customer_campaign`" idea —
`customer_campaign` is tracking only.

1. [x] `sesEmails` module + model + `Migration20261002120000` (`ses_emails` table, §4) — registered in `medusa-config.ts`, migrated locally.
2. [x] Audience resolution from customers/groups/`marketing_profile`, minus suppressed. Test audience = `marketing_profile.user_type = "test"`. **Customer lists = native customer groups** (`src/lib/ses/segment-audience.ts` + `GET /admin/customer-lists` + `POST /admin/customer-lists/from-segment` + `src/scripts/build-customer-list.ts`); generate accepts `group_id` → batch `audience="group:<id>"`.
3. [x] Template render (reuse `lib/email-templates`) — weekly-action renderer reused in-container via `buildWeeklyActionEmail`.
4. [x] `POST /admin/ses-emails/generate` (test group + weekly action → **replaces** `batch:test:weekly_action:<id>` rows; unsubscribed → `skipped`). Verified locally.
5. [x] `GET /admin/ses-emails?batch_id=…` — outbox list for the prototype page.
6. [ ] **ONE send function** (used by manual + queue): claim row via `FOR UPDATE SKIP LOCKED`, **🔒 re-check `unsubscribed=false` first (§7) → else `skipped`**, render from template, send via `sendCampaignEmail` (`campaign_id` tag + List-Unsubscribe), store `ses_message_id`, state machine `pending/queued → sending → sent/failed`, idempotent (R5).
7. [ ] Expose it two ways: `POST /admin/ses-emails/:id/send` + `…/send-batch` (send-now) **and** an `enqueue` (mark `queued`) drained by a throttled scheduled job at ≤ SES TPS.
8. [ ] On send, stamp `customer_campaign` (so opens/clicks attach). **Cross-channel suppression**: SES-originated unsubscribe → propagate to Brevo (**R1**).
9. [x] Seeded: `lib/ses/send.ts` → `sendCampaignEmail()`; single-recipient routes `POST /admin/email-campaigns/test-email` + `POST /admin/weekly-actions/:id/send`.
10. [ ] Later: `Campaign` model + per-campaign **channel selection** (`brevo` | `ses`) + scheduling.

### Phase 3 — Admin UI: Medusa admin extension at `/app/prototype-email-campaign` (Track C)

Built as `src/admin/routes/prototype-email-campaign/` — part of the Medusa admin, so it **shares
login, the SDK, and auth with zero extra code** (no separate app, no CORS, no token
handling). Rendered inside the admin shell; the page can be styled full-width.
Backend APIs under `/admin/email-campaigns/*` are called with the admin SDK (`/admin/campaigns` is reserved by Medusa core Promotions).

1. [~] `src/admin/routes/prototype-email-campaign/page.tsx` + sidebar entry ("E-Mail-Kampagnen", Envelope icon) at `/app/prototype-email-campaign`. **Done so far:** weekly-action picker + test-recipients table (via `GET /admin/custom?view=test-recipients` — see build note; migrate to a clean route later) + per-row "Test-E-Mail senden" → `POST /admin/weekly-actions/:id/send`.
2. [~] **Outbox section below the test list:** DONE — "E-Mails für Testkunden generieren" button (`POST /admin/ses-emails/generate`) + outbox table (`GET /admin/ses-emails?batch_id=…`: recipient · status · sent_at). TODO — per-row **Send** + **Send all / Enqueue all** (`/admin/ses-emails/:id/send`, `…/send-batch`, `…/enqueue`).
3. [ ] Data access via the admin SDK — `sdk.client.fetch(...)` / `sdk.admin.*` — **auth is automatic** (admin session). Load the `building-admin-dashboard-customizations` skill when implementing.
3. [ ] Campaigns list — both channels, `source` badge, open/click/bounce rates (**note the MPP caveat, R3**).
4. [ ] Campaign editor — channel picker, template + fields, audience picker, preview, test send, schedule/send.
5. [ ] Per-campaign recipients table + event timeline ("track every email").
6. [ ] Suppression / unsubscribed list view.

### Phase 4 — Hardening & go-live
1. [ ] GDPR/TTDSG consent review for open/click tracking (**R6**).
2. [ ] Seed `marketing_profile` from Brevo's suppression list (**R1**).
3. [ ] Reputation monitoring — SES bounce/complaint-rate alarms → SNS/admin.
4. [ ] Load-test the dispatcher at target volume; verify throttle, resume-after-crash, no double-send.
5. [ ] Runbook: pause a blast, reprocess `ses_event_log`, respond to a bounce/complaint spike.
