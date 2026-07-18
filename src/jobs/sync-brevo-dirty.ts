import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runBrevoDirtySync } from "../lib/brevo-sync"

/**
 * Every 5 minutes, re-sync the Brevo contacts flagged dirty by the marketing
 * webhook (`/webhooks/brevo`). Capped per run so it can't overlap its own
 * schedule; leftover dirty contacts roll to the next pass. This is the
 * "debounce" half of the hybrid webhook design — the nightly full sync remains
 * as reconciliation. Does nothing when BREVO_API_KEY is not configured.
 */
export default async function syncBrevoDirtyJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.BREVO_API_KEY) {
    return
  }

  try {
    await runBrevoDirtySync(container)
  } catch (err) {
    logger.error(`[brevo-dirty] Scheduled dirty-sync failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "sync-brevo-dirty",
  schedule: "*/5 * * * *",
}
