import { model } from "@medusajs/framework/utils"

/**
 * A scheduled/sent SEND RUN — the parent of a group of `ses_emails` rows
 * (`ses_emails.batch_id` = this id). One batch = "send template X to audience Y".
 * Holds the schedule + status + progress counters, so a run can be scheduled,
 * shown ("Geplant für …"), canceled, and resumed by the cron.
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`).
 */
const SesBatch = model.define("ses_batch", {
  id: model.id().primaryKey(),
  source_type: model.text(), // "weekly_action"
  source_id: model.text(),
  audience: model.text().default("test"), // "test" now; a customer-group id later
  // null = not scheduled (draft / send-now); a timestamp = fire at/after it.
  scheduled_at: model.dateTime().nullable(),
  // draft | scheduled | sending | sent | canceled | failed
  status: model.text().default("draft"),
  total: model.number().default(0),
  sent: model.number().default(0),
  failed: model.number().default(0),
  skipped: model.number().default(0),
})

export default SesBatch
