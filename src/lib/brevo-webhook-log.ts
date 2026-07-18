import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BREVO_WEBHOOK_LOG_MODULE } from "../modules/brevoWebhookLog"

/**
 * Durable audit log of every Brevo marketing webhook we receive.
 *
 * Backed by the `brevoWebhookLog` module + its hand-written migration (the table
 * is created by `medusa db:migrate`, never `db:generate`). Writes go through the
 * module service; retention is a raw hard-delete so old rows actually free space.
 */

export type BrevoWebhookLogEntry = {
  event: string
  email: string | null
  campaign_id: number | null
  /** Did the event map to a customer we flagged dirty? */
  matched: boolean
  payload: unknown
}

/** Insert one webhook event. Best-effort — the caller swallows failures. */
export async function logBrevoWebhookEvent(
  container: MedusaContainer,
  entry: BrevoWebhookLogEntry
): Promise<void> {
  const service: any = container.resolve(BREVO_WEBHOOK_LOG_MODULE)
  await service.createBrevoWebhookLogs({
    event: entry.event,
    email: entry.email,
    campaign_id: entry.campaign_id,
    matched: entry.matched,
    payload: entry.payload ?? {},
  })
}

/**
 * Hard-delete log rows older than `days`. Uses a raw DELETE (not the module's
 * soft-delete) so the retention job actually reclaims storage. Returns rows removed.
 */
export async function pruneBrevoWebhookLog(
  container: MedusaContainer,
  days = 30
): Promise<number> {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const d = Math.max(1, Math.floor(days))
  const deleted = await pg("brevo_webhook_log")
    .where("created_at", "<", pg.raw(`now() - interval '${d} days'`))
    .del()
  return typeof deleted === "number" ? deleted : 0
}
