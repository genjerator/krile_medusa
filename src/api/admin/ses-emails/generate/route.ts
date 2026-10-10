import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../../../../modules/sesEmails"
import { SES_BATCH_MODULE } from "../../../../modules/sesBatch"

type Body = { source_id?: string; source_type?: string; group_id?: string }

/**
 * POST /admin/ses-emails/generate  { source_id, source_type?, group_id? }
 * Generates a send batch for a template (default source_type "weekly_action"):
 * a real `ses_batch` row (assigned to the campaign) plus one `ses_emails` row per
 * recipient, tied to that batch via batch_id = the ses_batch id. Ref-based (no HTML
 * stored). Already-unsubscribed recipients are inserted as `skipped`.
 *
 * Audience:
 *   - `group_id` given → a CUSTOMER LIST (native customer group). Recipients are the
 *     group's members (with an email); batch audience = "group:<group_id>".
 *   - else → the TEST audience (`marketing_profile.user_type='test'`); audience "test".
 *
 * REPLACES per audience: deletes the existing batch(es) for that same audience (+
 * their rows) first, so re-generating refreshes membership for the latest campaign.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sesEmails: any = req.scope.resolve(SES_EMAILS_MODULE)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)

  const sourceId = (req.body?.source_id ?? "").trim()
  const sourceType = (req.body?.source_type ?? "weekly_action").trim()
  const groupId = (req.body?.group_id ?? "").trim()
  if (!sourceId) {
    return res.status(400).json({ message: "source_id is required" })
  }

  const audience = groupId ? `group:${groupId}` : "test"

  // Recipients + current unsubscribe state, by audience.
  let recipients: Array<{ customer_id: string; to_email: string; unsubscribed: boolean }>
  if (groupId) {
    const group = await pg("customer_group").where({ id: groupId }).whereNull("deleted_at").first()
    if (!group) {
      return res.status(404).json({ message: "Customer list (group) not found" })
    }
    recipients = await pg("customer_group_customer as cgc")
      .join("customer as c", "c.id", "cgc.customer_id")
      .leftJoin("marketing_profile as mp", "mp.customer_id", "c.id")
      .where("cgc.customer_group_id", groupId)
      .whereNull("cgc.deleted_at")
      .whereNull("c.deleted_at")
      .whereNotNull("c.email")
      .select("c.id as customer_id", "c.email as to_email")
      .select(pg.raw("COALESCE(mp.unsubscribed, false) as unsubscribed"))
      .orderBy("c.email")
  } else {
    recipients = await pg("marketing_profile as mp")
      .join("customer as c", "c.id", "mp.customer_id")
      .whereNull("mp.deleted_at")
      .whereNull("c.deleted_at")
      .where("mp.user_type", "test")
      .select("c.id as customer_id", "c.email as to_email", "mp.unsubscribed as unsubscribed")
      .orderBy("c.email")
  }

  // Replace: drop any existing batch(es) for this audience + their outbox rows.
  const prior = await pg("ses_batch").where("audience", audience).select("id")
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
      audience,
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
    `[ses-emails/generate] audience=${audience} batch=${batch.id} campaign=${sourceType}:${sourceId} total=${toCreate.length} pending=${pending} skipped=${skipped}`
  )
  return res.json({ ok: true, batch_id: batch.id, audience, total: toCreate.length, pending, skipped })
}
