import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../../../../modules/sesEmails"

type Body = { source_id?: string; source_type?: string }

/**
 * POST /admin/ses-emails/generate  { source_id, source_type? }
 * Generates the outbox for the TEST audience (marketing_profile.user_type='test')
 * for a template (default source_type "weekly_action"). Ref-based — no HTML stored.
 * REPLACES the batch: hard-deletes this batch's existing rows, then inserts fresh
 * `pending` rows (already-unsubscribed customers are inserted as `skipped`).
 * batch_id = `test:<source_type>:<source_id>`.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sesEmails: any = req.scope.resolve(SES_EMAILS_MODULE)

  const sourceId = (req.body?.source_id ?? "").trim()
  const sourceType = (req.body?.source_type ?? "weekly_action").trim()
  if (!sourceId) {
    return res.status(400).json({ message: "source_id is required" })
  }
  const batchId = `test:${sourceType}:${sourceId}`

  // Test audience + current unsubscribe state.
  const recipients = await pg("marketing_profile as mp")
    .join("customer as c", "c.id", "mp.customer_id")
    .whereNull("mp.deleted_at")
    .whereNull("c.deleted_at")
    .where("mp.user_type", "test")
    .select("c.id as customer_id", "c.email as to_email", "mp.unsubscribed as unsubscribed")
    .orderBy("c.email")

  // Replace: hard-delete this batch's existing rows, then re-create.
  await pg("ses_emails").where("batch_id", batchId).del()

  const now = new Date()
  const toCreate = recipients.map((r: any) => ({
    batch_id: batchId,
    source_type: sourceType,
    source_id: sourceId,
    customer_id: r.customer_id,
    to_email: r.to_email,
    status: r.unsubscribed ? "skipped" : "pending",
    generated_at: now,
  }))
  if (toCreate.length) {
    await sesEmails.createSesEmails(toCreate)
  }

  const pending = toCreate.filter((x) => x.status === "pending").length
  const skipped = toCreate.length - pending
  logger.info(`[ses-emails/generate] batch=${batchId} total=${toCreate.length} pending=${pending} skipped=${skipped}`)
  return res.json({ ok: true, batch_id: batchId, total: toCreate.length, pending, skipped })
}
