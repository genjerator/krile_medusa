import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
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
 * Mark a customer unsubscribed AND soft-delete them immediately (idempotent).
 * Used by the unsubscribe route and by the SES webhook on hard bounce / complaint
 * — so every SES suppression event (complaint / hard bounce / unsubscribe click)
 * takes the customer out of the active base right away, not only at the nightly
 * cleanup. Soft delete (reversible) also removes them from the nightly priority
 * recompute's scope (`where c.deleted_at is null`), which is what previously
 * un-suppressed SES-only events (they have no Brevo metadata to re-derive from).
 *
 * `priority` is set to 'unsubscribed' (not 'none') so the nightly
 * `softDeleteUnsubscribedCustomers` is a correct fallback if the immediate soft
 * delete below ever fails.
 */
export async function setUnsubscribed(
  container: MedusaContainer,
  customerId: string,
  when: Date = new Date()
): Promise<void> {
  await upsertMarketingProfile(container, customerId, {
    unsubscribed: true,
    unsubscribed_at: when,
    priority: "unsubscribed",
    priority_rank: SUPPRESSED_RANK,
  })

  // Remove from the active base immediately (soft delete — reversible via the
  // customer module's restore). No-op if already soft-deleted.
  const customerModule: any = container.resolve(Modules.CUSTOMER)
  await customerModule.softDeleteCustomers([customerId])
}
