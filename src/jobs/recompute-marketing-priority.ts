import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { recomputeMarketingPriorities } from "../lib/marketing-priority"

/**
 * Nightly recompute of every customer's marketing priority into
 * marketing_profile (see lib/marketing-priority). Pure DB work — no external
 * calls — so it always runs.
 */
export default async function recomputeMarketingPriorityJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await recomputeMarketingPriorities(container)
  } catch (err) {
    logger.error(`[marketing-priority] Recompute failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "recompute-marketing-priority",
  schedule: "0 3 * * *",
}
