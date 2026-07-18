import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { pruneBrevoWebhookLog } from "../lib/brevo-webhook-log"

/**
 * Daily retention for the Brevo webhook audit log — deletes rows older than
 * 30 days so the table stays bounded. Runs regardless of BREVO_API_KEY (it only
 * touches our own table, no Brevo calls).
 */
export default async function pruneBrevoWebhookLogJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const deleted = await pruneBrevoWebhookLog(container, 30)
    if (deleted > 0) {
      logger.info(`[brevo-webhook] Pruned ${deleted} log row(s) older than 30 days.`)
    }
  } catch (err) {
    logger.error(`[brevo-webhook] Log prune failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "prune-brevo-webhook-log",
  schedule: "30 4 * * *",
}
