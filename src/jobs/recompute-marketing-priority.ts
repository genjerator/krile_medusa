import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { recomputeMarketingPriorities } from "../lib/marketing-priority"
import { softDeleteUnsubscribedCustomers } from "../lib/soft-delete-unsubscribed"

/**
 * Nightly recompute of every customer's marketing priority into
 * marketing_profile (see lib/marketing-priority). Pure DB work — no external
 * calls — so it always runs. After recomputing, soft-deletes any customer that
 * ended up 'unsubscribed' so they leave the customer list / CSV export.
 */
export default async function recomputeMarketingPriorityJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await recomputeMarketingPriorities(container)
    await softDeleteUnsubscribedCustomers(container)
  } catch (err) {
    logger.error(`[marketing-priority] Recompute/cleanup failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "recompute-marketing-priority",
  schedule: "0 3 * * *",
}
