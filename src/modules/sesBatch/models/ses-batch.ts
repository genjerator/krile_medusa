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
  // Campaign ref — NULLABLE: a batch can be built as a campaign-agnostic audience
  // segment first, then have a campaign assigned later (stamped onto the batch and
  // all its ses_emails rows). null = unassigned (not sendable yet).
  source_type: model.text().nullable(), // "weekly_action"
  source_id: model.text().nullable(),
  // Owning campaign (marketing `campaign.id`), when this batch is a campaign
  // group-send. NULL for prototype / ad-hoc batches — the prototype's audience-keyed
  // queries ignore campaign batches via their `cmp:*` audience namespace, and this
  // column lets campaign stats query all of a campaign's group-sends at once.
  campaign_id: model.text().nullable(),
  audience: model.text().default("test"), // "test" / "group:<id>" / "cmp:<cid>:<gid>"
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
