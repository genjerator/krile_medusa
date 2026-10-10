import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { drainSesQueue } from "../lib/ses/send-queue"

/**
 * Drains the SES campaign send queue every minute: sends a bounded chunk of
 * `queued` outbox rows through the single send function, paced under the SES
 * account's send rate. Idempotent + resumable — a crash mid-blast just continues
 * on the next tick. Enqueue a group/campaign via POST /admin/email-campaigns/:id/send.
 *
 * `SES_QUEUE_CHUNK` (default 75) caps rows per run = per-minute throughput.
 * `SES_QUEUE_DELAY_MS` (default 0) adds a pause between sends for finer pacing.
 */
export default async function sendSesQueueJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const chunk = Number(process.env.SES_QUEUE_CHUNK) || 75
  const delayMs = Number(process.env.SES_QUEUE_DELAY_MS) || 0
  try {
    const res = await drainSesQueue(container, { chunk, delayMs })
    if (res.claimed > 0) {
      logger.info(
        `[send-ses-queue] drained ${res.claimed}: sent=${res.sent} skipped=${res.skipped} failed=${res.failed}`
      )
    }
  } catch (err) {
    logger.error(`[send-ses-queue] drain failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "send-ses-queue",
  schedule: "* * * * *",
}
