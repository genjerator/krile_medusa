import { model } from "@medusajs/framework/utils"

/**
 * Durable audit record of one received Brevo marketing webhook event.
 * The table is created by a HAND-WRITTEN migration (never `db:generate`, which
 * would drop the shared DB's core tables — see the reparatur module migrations).
 */
const BrevoWebhookLog = model.define("brevo_webhook_log", {
  id: model.id().primaryKey(),
  event: model.text().nullable(),
  email: model.text().nullable(),
  campaign_id: model.number().nullable(),
  // Did the event map to a customer we flagged dirty?
  matched: model.boolean().default(false),
  // Raw webhook body, for debugging.
  payload: model.json().nullable(),
})

export default BrevoWebhookLog
