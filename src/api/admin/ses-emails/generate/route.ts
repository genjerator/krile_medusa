import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../../../../modules/sesEmails"
import { SES_BATCH_MODULE } from "../../../../modules/sesBatch"

type Body = { source_id?: string; source_type?: string }

/**
 * POST /admin/ses-emails/generate  { source_id, source_type? }
 * Generates the TEST batch for a template (default source_type "weekly_action"):
 * a real `ses_batch` row (audience "test", assigned to the campaign) plus one
 * `ses_emails` row per test recipient (marketing_profile.user_type='test'), tied to
 * that batch via batch_id = the ses_batch id — exactly like the ramp batches, so the
 * test send is its own batch in the batches list. Ref-based (no HTML stored).
 * REPLACES: deletes any existing "test" batch (+ its rows) first, so there is always
 * exactly one test batch, for the most recently generated campaign. Already
 * unsubscribed recipients are inserted as `skipped`.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sesEmails: any = req.scope.resolve(SES_EMAILS_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)

  const sourceId = (req.body?.source_id ?? "").trim()
  const sourceType = (req.body?.source_type ?? "weekly_action").trim()
  if (!sourceId) {
    return res.status(400).json({ message: "source_id is required" })
  }

  // Test audience + current unsubscribe state.
  const recipients = await pg("marketing_profile as mp")
    .join("customer as c", "c.id", "mp.customer_id")
    .whereNull("mp.deleted_at")
    .whereNull("c.deleted_at")
    .where("mp.user_type", "test")
    .select("c.id as customer_id", "c.email as to_email", "mp.unsubscribed as unsubscribed")
    .orderBy("c.email")

  // Replace: drop any existing test batch(es) + their outbox rows, then recreate.
  const prior = await pg("ses_batch").where("audience", "test").select("id")
  if (prior.length) {
    const ids = prior.map((p: any) => p.id)
    await pg("ses_emails").whereIn("batch_id", ids).del()
    await sesBatch.deleteSesBatches(ids)
  }

  const now = new Date()
  const [batch] = await sesBatch.createSesBatches([
    {
      source_type: sourceType,
      source_id: sourceId,
      audience: "test",
      status: "draft",
      total: recipients.length,
    },
  ])

  const toCreate = recipients.map((r: any) => ({
    batch_id: batch.id,
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
  logger.info(
    `[ses-emails/generate] test batch=${batch.id} campaign=${sourceType}:${sourceId} total=${toCreate.length} pending=${pending} skipped=${skipped}`
  )
  return res.json({ ok: true, batch_id: batch.id, total: toCreate.length, pending, skipped })
}
