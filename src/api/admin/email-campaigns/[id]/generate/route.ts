import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"
import { SES_BATCH_MODULE } from "../../../../../modules/sesBatch"
import { SES_EMAILS_MODULE } from "../../../../../modules/sesEmails"
import { isTestRecipient, parseGroupSendAudience, resolveGroupRecipients } from "../../../../../lib/ses/campaign-groups"

type Body = { group_id?: string }

/**
 * POST /admin/email-campaigns/:id/generate  { group_id? }
 * (Re)generates the outbox (`ses_emails`) for the campaign's group-sends: resolves
 * each group's current mailable members and writes one ref-based row per recipient
 * (no HTML stored — rendered at send time). Already-unsubscribed members are
 * written as `skipped`. REPLACES a batch's rows, so re-generating refreshes
 * membership. Batches that have already sent mail are left untouched (reported as
 * skipped) so send history is never wiped.
 *
 * `group_id` targets one group; omitted = every assigned group.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)
  const sesEmails: any = req.scope.resolve(SES_EMAILS_MODULE)
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

  const now = new Date()
  const results: Array<{ group_id: string; batch_id: string; total: number; pending: number; skipped: number; status: string }> = []

  for (const t of targets as Array<{ batch_id: string; group_id: string }>) {
    // Never wipe a batch that has sent mail.
    const sentCount = await pg("ses_emails").where("batch_id", t.batch_id).where("status", "sent").count("* as c").first()
    if (Number(sentCount?.c ?? 0) > 0) {
      results.push({ group_id: t.group_id, batch_id: t.batch_id, total: 0, pending: 0, skipped: 0, status: "already_sent" })
      continue
    }

    const recipients = await resolveGroupRecipients(pg, t.group_id)

    // Replace this batch's outbox rows.
    await pg("ses_emails").where("batch_id", t.batch_id).del()

    // One-email-per-customer-per-campaign: drop any NON-test recipient already
    // present in another group-send of this campaign (first group to hold them
    // wins). Test customers (user_type="test") are kept so they can be mailed from
    // several groups. The send path enforces this authoritatively too.
    const siblingIds: string[] = await pg("ses_emails as e")
      .join("ses_batch as b", "b.id", "e.batch_id")
      .where("b.campaign_id", id)
      .whereNull("b.deleted_at")
      .whereNot("e.batch_id", t.batch_id)
      .distinct("e.customer_id")
      .pluck("e.customer_id")
    const siblingSet = new Set(siblingIds)
    const deduped = recipients.filter((r) => isTestRecipient(r) || !siblingSet.has(r.customer_id))

    const toCreate = deduped.map((r) => ({
      batch_id: t.batch_id,
      source_type: "weekly_action",
      source_id: campaign.weekly_action_id,
      customer_id: r.customer_id,
      to_email: r.to_email,
      status: r.unsubscribed ? "skipped" : "pending",
      generated_at: now,
    }))
    if (toCreate.length) await sesEmails.createSesEmails(toCreate)

    const pending = toCreate.filter((x) => x.status === "pending").length
    const skipped = toCreate.length - pending
    await sesBatch.updateSesBatches({ id: t.batch_id, status: "draft", total: toCreate.length, sent: 0, failed: 0, skipped })
    results.push({ group_id: t.group_id, batch_id: t.batch_id, total: toCreate.length, pending, skipped, status: "generated" })
  }

  // Advance campaign status to "ready" once something is generated.
  const anyGenerated = results.some((r) => r.status === "generated")
  if (anyGenerated && campaign.status === "draft") {
    await marketing.updateEmailCampaigns([{ id, status: "ready" }])
  }

  logger.info(`[campaigns/generate] campaign=${id} targets=${targets.length} ${results.map((r) => `${r.group_id}:${r.status}(${r.total})`).join(" ")}`)
  res.json({ ok: true, results })
}
