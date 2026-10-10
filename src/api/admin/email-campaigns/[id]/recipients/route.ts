import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"

/**
 * GET /admin/email-campaigns/:id/recipients?batch_id=<id>&filter=<all|opened|clicked|bounced|unsubscribed>
 * Per-recipient list for a campaign (or one group-send), joining the outbox
 * (`ses_emails`) to engagement (`customer_campaign`, keyed on campaign_id = the
 * group's batch id + customer_id). Returns delivery status plus whether each
 * recipient was delivered / opened / clicked / bounced / unsubscribed — so you can
 * see exactly which customer did what, and filter to e.g. only bounces.
 *
 * `batch_id` scopes to one group-send; omitted = all the campaign's group-sends.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const batchId = typeof req.query.batch_id === "string" ? req.query.batch_id.trim() : ""
  const filter = typeof req.query.filter === "string" ? req.query.filter.trim() : "all"

  // Resolve the campaign's group-send batches (optionally one).
  const batchQ = pg("ses_batch").where({ campaign_id: id }).whereNull("deleted_at").select("id")
  if (batchId) batchQ.where("id", batchId)
  const batchIds: string[] = (await batchQ).map((b: any) => b.id)
  if (!batchIds.length) return res.json({ recipients: [], count: 0 })

  const q = pg("ses_emails as e")
    .leftJoin("customer as c", "c.id", "e.customer_id")
    .leftJoin("customer_campaign as cc", function (this: any) {
      this.on("cc.campaign_id", "=", "e.batch_id")
        .andOn("cc.customer_id", "=", "e.customer_id")
        .andOnVal("cc.source", "=", "ses")
        .andOnNull("cc.deleted_at")
    })
    .whereIn("e.batch_id", batchIds)
    .select(
      "e.id",
      "e.to_email",
      "e.status",
      "e.error",
      "e.sent_at",
      "c.first_name",
      "c.last_name",
      "cc.delivered_at",
      "cc.opened_at",
      "cc.clicked_at",
      "cc.bounced_at",
      "cc.unsubscribed_at"
    )
    .orderBy("e.to_email", "asc")
    .limit(2000)

  if (filter === "opened") q.whereNotNull("cc.opened_at")
  else if (filter === "clicked") q.whereNotNull("cc.clicked_at")
  else if (filter === "bounced") q.whereNotNull("cc.bounced_at")
  else if (filter === "unsubscribed") q.whereNotNull("cc.unsubscribed_at")

  const recipients = await q
  res.json({ recipients, count: recipients.length })
}
