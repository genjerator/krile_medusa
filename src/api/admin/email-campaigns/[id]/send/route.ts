import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"
import { SES_BATCH_MODULE } from "../../../../../modules/sesBatch"
import { parseGroupSendAudience } from "../../../../../lib/ses/campaign-groups"

type Body = { group_id?: string }

/**
 * POST /admin/email-campaigns/:id/send  { group_id? }
 * ENQUEUES a campaign for background sending: flips each target group-send's
 * sendable outbox rows (status pending | failed) to `queued`. The `send-ses-queue`
 * scheduled job drains them, throttled, through the single send function. Returns
 * immediately — nothing is sent in this request.
 *
 * `group_id` enqueues one group; omitted = every assigned group ("send campaign").
 * Standalone single-recipient sends stay on POST /admin/ses-emails/:id/send.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const targetGroup = (req.body?.group_id ?? "").trim() || null

  const batches = await pg("ses_batch").where({ campaign_id: id }).whereNull("deleted_at").select("id", "audience")
  const targets = batches
    .map((b: any) => ({ batch_id: b.id, group_id: parseGroupSendAudience(b.audience)?.groupId ?? null }))
    .filter((t: any) => t.group_id && (!targetGroup || t.group_id === targetGroup))

  if (!targets.length) {
    return res.status(400).json({
      message: targetGroup ? "That group is not assigned to this campaign" : "No groups assigned yet",
    })
  }

  const perGroup: Array<{ group_id: string; batch_id: string; enqueued: number }> = []
  let totalEnqueued = 0
  for (const t of targets as Array<{ batch_id: string; group_id: string }>) {
    const enqueued = await pg("ses_emails")
      .where("batch_id", t.batch_id)
      .whereIn("status", ["pending", "failed"])
      .update({ status: "queued" })
    totalEnqueued += enqueued
    if (enqueued > 0) {
      await sesBatch.updateSesBatches({ id: t.batch_id, status: "sending" })
    }
    perGroup.push({ group_id: t.group_id, batch_id: t.batch_id, enqueued })
  }

  if (totalEnqueued > 0 && campaign.status !== "sending") {
    await marketing.updateEmailCampaigns([{ id, status: "sending" }])
  }

  logger.info(`[campaigns/send] campaign=${id} targets=${targets.length} enqueued=${totalEnqueued}`)
  res.json({ ok: true, enqueued: totalEnqueued, per_group: perGroup })
}
