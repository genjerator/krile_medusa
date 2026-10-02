import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../modules/marketing"

/**
 * Helpers for `marketing_profile` (1:1 per customer — unsubscribe flag + priority)
 * and resolving a customer by email. Shared by the SES webhook (suppress on hard
 * bounce / complaint) and the unsubscribe route. `priority_rank = 99` is the
 * "suppressed" sentinel the recompute job also uses for unsubscribed customers.
 */

const SUPPRESSED_RANK = 99

/** Resolve a customer id from an email (case-insensitive), or null. */
export async function findCustomerIdByEmail(
  container: MedusaContainer,
  email: string
): Promise<string | null> {
  if (!email) return null
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const row = await pg("customer")
    .whereNull("deleted_at")
    .whereRaw("lower(email) = ?", [email.toLowerCase()])
    .first("id")
  return row?.id ?? null
}

/** Insert or update a customer's marketing_profile with the given patch. */
export async function upsertMarketingProfile(
  container: MedusaContainer,
  customerId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const marketing: any = container.resolve(MARKETING_MODULE)
  const [existing] = await marketing.listMarketingProfiles(
    { customer_id: customerId },
    { take: 1 }
  )
  if (existing) {
    await marketing.updateMarketingProfiles({ id: existing.id, ...patch })
  } else {
    await marketing.createMarketingProfiles({ customer_id: customerId, ...patch })
  }
}

/**
 * Mark a customer unsubscribed (idempotent). Used by the unsubscribe route and by
 * the SES webhook on hard bounce / complaint. Forces the suppressed priority rank.
 */
export async function setUnsubscribed(
  container: MedusaContainer,
  customerId: string,
  when: Date = new Date()
): Promise<void> {
  await upsertMarketingProfile(container, customerId, {
    unsubscribed: true,
    unsubscribed_at: when,
    priority: "none",
    priority_rank: SUPPRESSED_RANK,
  })
}
