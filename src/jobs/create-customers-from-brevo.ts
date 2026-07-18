import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createMissingCustomersFromBrevo } from "../lib/brevo-sync"

/**
 * Turns deliverable Brevo contacts into Medusa customers: every ~15 min it
 * scans the webhook audit log for emails that received (or engaged with) a
 * campaign but aren't customers yet, confirms them against Brevo, and creates
 * the missing ones. Does nothing when BREVO_API_KEY is not configured.
 */
export default async function createCustomersFromBrevoJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.BREVO_API_KEY) {
    return
  }

  try {
    await createMissingCustomersFromBrevo(container)
  } catch (err) {
    logger.error(`[brevo-create] Scheduled customer creation failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "create-customers-from-brevo",
  schedule: "*/15 * * * *",
}
