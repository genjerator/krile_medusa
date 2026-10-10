import { model } from "@medusajs/framework/utils"

/**
 * A real email CAMPAIGN — the coordinator the admin "Campaigns" page drives, and
 * the first-class successor to the ad-hoc prototype (which keyed everything on the
 * weekly-action id). A campaign is:
 *
 *   name  +  one weekly action (the content/body)  +  a subject override
 *         +  a set of assigned customer groups.
 *
 * Each assigned group becomes ONE `ses_batch` (a "group-send"), tagged with this
 * campaign's id (`ses_batch.campaign_id`) and audience `cmp:<campaignId>:<groupId>`
 * — a namespace the prototype's audience-keyed queries/deletes never touch, so the
 * two systems stay isolated. The batch's `ses_emails` are the per-recipient outbox
 * rows; engagement rolls up through `customer_campaign` for per-group stats.
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`, which drops the
 * shared DB's core tables — see the sibling marketing / sesEventLog migrations).
 */
const Campaign = model.define("email_campaign", {
  id: model.id().primaryKey(),
  // Admin-facing name (internal label, not shown to customers).
  name: model.text(),
  // Content source — the weekly action whose email is rendered as the body. Plain
  // id column (not a formal module link), consistent with the other marketing
  // tables being driven by our own jobs rather than Medusa links.
  weekly_action_id: model.text(),
  // Customer-facing subject OVERRIDE. Nullable: falls back to the weekly action's
  // `email_subject`, then its `title` (see the send path).
  subject: model.text().nullable(),
  // draft → ready (groups assigned + outbox generated) → scheduled / sending → sent.
  // `canceled` is terminal. Status is advisory for the UI; the authoritative send
  // state always lives on the per-group `ses_batch` + `ses_emails` rows.
  status: model.text().default("draft"),
  // Reserved for a future "schedule this send" feature (fire at/after this time).
  // Not a start/end date — a campaign has no date window.
  scheduled_at: model.dateTime().nullable(),
  // Completion timestamp — set when the last group finished sending.
  sent_at: model.dateTime().nullable(),
})

export default Campaign
