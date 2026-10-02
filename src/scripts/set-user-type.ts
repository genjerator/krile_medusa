import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { findCustomerIdByEmail, upsertMarketingProfile } from "../lib/ses/marketing-profile"

/**
 * Sets `marketing_profile.user_type` for a customer, by email. Upserts the
 * profile if the customer has none yet.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/set-user-type.ts <email> <user_type>
 *   e.g. npx medusa exec ./src/scripts/set-user-type.ts qa@planeta.de test
 */
export default async function setUserType({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const [email, userType] = args

  if (!email || !userType) {
    logger.error('Usage: medusa exec ./src/scripts/set-user-type.ts <email> <user_type>')
    return
  }

  const customerId = await findCustomerIdByEmail(container, email)
  if (!customerId) {
    logger.error(`No customer found with email "${email}".`)
    return
  }

  await upsertMarketingProfile(container, customerId, { user_type: userType })
  logger.info(`✅ Set user_type="${userType}" for ${email} (${customerId}).`)
}
