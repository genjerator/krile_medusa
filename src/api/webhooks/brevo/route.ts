import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { markContactDirty } from "../../../lib/brevo-sync"
import { logBrevoWebhookEvent } from "../../../lib/brevo-webhook-log"

/**
 * POST /webhooks/brevo?token=<BREVO_WEBHOOK_TOKEN>
 *
 * Receiver for Brevo Marketing webhooks (opened/click/bounce/unsubscribe/…).
 * Token is checked in middlewares.ts. Kept minimal on the hot path: flag the
 * affected contact dirty, record the event to the audit log, return 200. The
 * actual stat fetch is deferred to the throttled `sync-brevo-dirty` job, so a
 * campaign-blast burst costs cheap writes, not thousands of Brevo API calls.
 *
 * We always answer 200 (even on our own errors) so Brevo does not retry-storm;
 * anything missed is caught by the nightly reconciliation poll.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const body = (req.body ?? {}) as Record<string, unknown>

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const event = typeof body.event === "string" ? body.event : "unknown"

  // Marketing events carry the campaign under `camp_id`; be tolerant of shape.
  const rawCamp = body["camp_id"] ?? body["campaign id"] ?? body["campaignId"]
  const campaign_id =
    rawCamp != null && Number.isInteger(Number(rawCamp)) ? Number(rawCamp) : null

  let matched = false
  try {
    if (email) matched = (await markContactDirty(req.scope, email)) > 0
  } catch (err) {
    logger.error(`[brevo-webhook] Failed to mark ${email} dirty: ${(err as Error).message}`)
  }

  // Full audit log — best-effort, never blocks the 200.
  try {
    await logBrevoWebhookEvent(req.scope, {
      event,
      email: email || null,
      campaign_id,
      matched,
      payload: body,
    })
  } catch (err) {
    logger.error(`[brevo-webhook] Failed to log event: ${(err as Error).message}`)
  }

  logger.info(
    `[brevo-webhook] ${event} for ${email || "(no email)"} → matched=${matched}`
  )
  return res.status(200).json({ ok: true })
}
