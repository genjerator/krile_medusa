import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { verifySnsMessage, confirmSnsSubscription, SnsMessage } from "../../../lib/ses/sns"
import { recordSesEvent } from "../../../lib/ses/ses-events"

/**
 * POST /webhooks/ses?token=<SES_WEBHOOK_TOKEN>
 *
 * Receiver for SES events delivered via SNS (open/click/bounce/complaint/
 * delivery/send/reject). Token is checked in middlewares.ts. We verify the SNS
 * signature, auto-confirm subscriptions, and record Notification events.
 *
 * Always answers 200 (even on our own errors) so SNS does not retry-storm —
 * every event is written to `ses_event_log` first, so nothing is lost and
 * anything that failed to apply can be reprocessed from the log.
 *
 * SNS POSTs as text/plain, which Medusa's text body-parser turns into a string;
 * application/json would arrive as an object. Handle both.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  let msg: SnsMessage
  try {
    msg = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as SnsMessage)
  } catch {
    logger.warn("[ses-webhook] Unparseable body — ignoring.")
    return res.status(200).json({ ok: true })
  }

  try {
    const valid = await verifySnsMessage(msg)
    if (!valid) {
      logger.warn(`[ses-webhook] Invalid SNS signature (type=${msg?.Type}) — ignoring.`)
      return res.status(200).json({ ok: true })
    }

    switch (msg.Type) {
      case "SubscriptionConfirmation":
      case "UnsubscribeConfirmation":
        await confirmSnsSubscription(msg)
        logger.info(`[ses-webhook] ${msg.Type} confirmed for ${msg.TopicArn}`)
        break

      case "Notification": {
        const event = typeof msg.Message === "string" ? JSON.parse(msg.Message) : msg.Message
        const { matched } = await recordSesEvent(req.scope, event)
        logger.info(
          `[ses-webhook] ${event?.eventType ?? event?.notificationType ?? "event"} → matched=${matched}`
        )
        break
      }

      default:
        logger.info(`[ses-webhook] Ignoring SNS type ${msg?.Type}`)
    }
  } catch (err) {
    logger.error(`[ses-webhook] Handler error: ${(err as Error).message}`)
  }

  return res.status(200).json({ ok: true })
}
