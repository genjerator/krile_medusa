import { model } from "@medusajs/framework/utils"

/**
 * The SES OUTBOX: one row per (recipient, generation) — a per-recipient intent to
 * send a template. Ref-based (NO stored HTML): the email is rendered at send time
 * from `source_type`/`source_id` (e.g. "weekly_action" + id). Re-generating a
 * `batch_id` REPLACES its rows. Distinct from `customer_campaign` (engagement
 * tracking) — the two link via `ses_message_id` once a row is sent.
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`, which drops the
 * shared DB's core tables — see the marketing / sesEventLog migrations).
 */
const SesEmail = model.define("ses_emails", {
  id: model.id().primaryKey(),
  // Groups one generation run (e.g. "test customers · weekly action X").
  batch_id: model.text().nullable(),
  // Template reference — rendered at send time. `source_id` doubles as the SES
  // campaign_id tag. NULLABLE: an outbox row can be generated as a bare audience
  // member (batch segment) before a campaign is assigned; the sender refuses to
  // send until both are set.
  source_type: model.text().nullable(), // e.g. "weekly_action"
  source_id: model.text().nullable(),
  customer_id: model.text(),
  to_email: model.text(), // denormalized recipient
  // Optional per-row render data (future personalization); unsubscribe link is
  // derived from customer_id + source_id, so none required for now.
  data: model.json().nullable(),
  // pending | queued | sending | sent | failed | skipped
  status: model.text().default("pending"),
  ses_message_id: model.text().nullable(), // set on send → links to customer_campaign
  error: model.text().nullable(),
  attempts: model.number().default(0),
  generated_at: model.dateTime().nullable(),
  sent_at: model.dateTime().nullable(),
})

export default SesEmail
