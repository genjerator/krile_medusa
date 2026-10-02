import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { pruneSesEventLog } from "../lib/ses/ses-event-log"

/**
 * Daily retention for the SES event audit log — deletes rows older than 30 days
 * so the table stays bounded (SES can emit many events per send, esp. opens).
 * Touches only our own table.
 */
export default async function pruneSesEventLogJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const deleted = await pruneSesEventLog(container, 30)
    if (deleted > 0) {
      logger.info(`[ses-webhook] Pruned ${deleted} log row(s) older than 30 days.`)
    }
  } catch (err) {
    logger.error(`[ses-webhook] Log prune failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "prune-ses-event-log",
  schedule: "35 4 * * *",
}
