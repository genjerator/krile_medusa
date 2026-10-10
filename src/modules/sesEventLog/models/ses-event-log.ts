import { model } from "@medusajs/framework/utils"

/**
 * Durable audit record of one received SES event (via SNS). Written FIRST, before
 * any matching logic, so a handler error never loses the event — SES has no
 * re-poll (unlike Brevo), so the log is the only reprocessing source.
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`, which drops the
 * shared DB's core tables — see the marketing / reparatur module migrations).
 */
const SesEventLog = model.define("ses_event_log", {
  id: model.id().primaryKey(),
  event: model.text().nullable(), // Open | Click | Bounce | Complaint | Delivery | Send | Reject
  email: model.text().nullable(),
  message_id: model.text().nullable(), // SES mail.messageId
  campaign_id: model.text().nullable(), // from the SES message tag, when present
  // For Click events: the clicked URL (`event.click.link`), so we can report which
  // link in an email was clicked. Null for non-click events.
  link: model.text().nullable(),
  // Did the event map to a customer / campaign row we updated?
  matched: model.boolean().default(false),
  payload: model.json().nullable(), // raw SES event, for debugging / reprocessing
})

export default SesEventLog
