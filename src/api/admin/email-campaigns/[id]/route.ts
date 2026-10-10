import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../modules/marketing"
import { SES_BATCH_MODULE } from "../../../../modules/sesBatch"
import { parseGroupSendAudience } from "../../../../lib/ses/campaign-groups"

type UpdateBody = { name?: string; subject?: string }

/**
 * GET /admin/email-campaigns/:id
 * Returns the campaign, its resolved subject (override → weekly action subject →
 * title), and its group-sends: one per assigned customer group, each with the
 * group's name and LIVE per-status counts of its outbox (`ses_emails`) rows.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const wa = await pg("weekly_action")
    .where({ id: campaign.weekly_action_id })
    .whereNull("deleted_at")
    .first()
  const resolvedSubject = campaign.subject || wa?.email_subject || wa?.title || null

  const batches = await pg("ses_batch")
    .where({ campaign_id: id })
    .whereNull("deleted_at")
    .select("id", "audience", "status", "scheduled_at", "total", "created_at")
    .orderBy("created_at", "asc")

  // Group names + per-batch outbox counts.
  const groupIds = batches
    .map((b: any) => parseGroupSendAudience(b.audience)?.groupId)
    .filter(Boolean) as string[]
  const nameById: Record<string, string> = {}
  if (groupIds.length) {
    const groups = await pg("customer_group").whereIn("id", groupIds).select("id", "name")
    for (const g of groups as any[]) nameById[g.id] = g.name
  }
  const counts: Record<string, Record<string, number>> = {}
  const batchIds = batches.map((b: any) => b.id)
  if (batchIds.length) {
    const rows = await pg("ses_emails")
      .whereIn("batch_id", batchIds)
      .groupBy("batch_id", "status")
      .select("batch_id", "status")
      .count("* as c")
    for (const r of rows as any[]) (counts[r.batch_id] ??= {})[r.status] = Number(r.c)
  }

  const groupSends = batches.map((b: any) => {
    const gid = parseGroupSendAudience(b.audience)?.groupId ?? null
    return {
      batch_id: b.id,
      group_id: gid,
      group_name: gid ? nameById[gid] ?? null : null,
      status: b.status,
      scheduled_at: b.scheduled_at,
      total: b.total,
      counts: counts[b.id] ?? {},
    }
  })

  res.json({
    campaign: { ...campaign, weekly_action_title: wa?.title ?? null, resolved_subject: resolvedSubject },
    group_sends: groupSends,
  })
}

/**
 * POST /admin/email-campaigns/:id  { name?, subject? }
 * Updates campaign metadata (name / subject override). Medusa allows only
 * GET/POST/DELETE, so edits use POST.
 */
export async function POST(req: AuthenticatedMedusaRequest<UpdateBody>, res: MedusaResponse) {
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const id = req.params.id

  const existing = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!existing) return res.status(404).json({ message: "Campaign not found" })

  const update: Record<string, any> = { id }
  if (typeof req.body?.name === "string") {
    const name = req.body.name.trim()
    if (!name) return res.status(400).json({ message: "name cannot be empty" })
    update.name = name
  }
  if (typeof req.body?.subject === "string") {
    update.subject = req.body.subject.trim() || null
  }

  const [campaign] = await marketing.updateEmailCampaigns([update])
  res.json({ campaign })
}

/**
 * DELETE /admin/email-campaigns/:id
 * Removes the campaign and all its group-sends (ses_batch rows) + their outbox
 * (ses_emails) rows. Engagement already recorded in `customer_campaign` is left
 * intact (historical). Refuses once any mail has gone out.
 */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)
  const id = req.params.id

  const existing = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!existing) return res.status(404).json({ message: "Campaign not found" })

  const batches = await pg("ses_batch").where({ campaign_id: id }).whereNull("deleted_at").select("id")
  const batchIds = batches.map((b: any) => b.id)
  if (batchIds.length) {
    const sentCount = await pg("ses_emails")
      .whereIn("batch_id", batchIds)
      .where("status", "sent")
      .count("* as c")
      .first()
    if (Number(sentCount?.c ?? 0) > 0) {
      return res.status(409).json({ message: "Campaign has already sent mail and cannot be deleted" })
    }
    await pg("ses_emails").whereIn("batch_id", batchIds).del()
    await sesBatch.deleteSesBatches(batchIds)
  }
  await marketing.deleteEmailCampaigns([id])
  res.json({ ok: true, id })
}
