import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runBrevoSync } from "../lib/brevo-sync"

/**
 * Nightly sync of Brevo email-engagement stats into customer metadata.
 * Does nothing when BREVO_API_KEY is not configured.
 */
export default async function syncBrevoStatsJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.BREVO_API_KEY) {
    logger.info("[brevo-sync] BREVO_API_KEY not set — skipping scheduled sync.")
    return
  }

  await runBrevoSync(container)
}

export const config = {
  name: "sync-brevo-stats",
  schedule: "0 4 * * *",
}
