import { model } from "@medusajs/framework/utils"

/**
 * One row per (customer, campaign): a customer's participation in a single
 * external email campaign. A customer has many of these; each belongs to one
 * customer. Uniqueness on (source, campaign_id, customer_id) guarantees a single
 * row per customer per campaign — opened/clicked are timestamps set once on that
 * row, never duplicated. `customer_id` is a plain indexed column (not a formal
 * module link) since these tables are driven by our own jobs/webhook.
 */
const CustomerCampaign = model.define("customer_campaign", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  source: model.text(), // brevo, ses, ...
  campaign_id: model.text(), // external provider campaign id, or internal campaign id for SES
  // SES message id (set by the sender). Precise match key for incoming SES events.
  ses_message_id: model.text().nullable(),
  sent_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
  opened_at: model.dateTime().nullable(),
  clicked_at: model.dateTime().nullable(),
  bounced_at: model.dateTime().nullable(),
  complained_at: model.dateTime().nullable(),
  unsubscribed_at: model.dateTime().nullable(),
})

export default CustomerCampaign
