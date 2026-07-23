import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Soft-deletes every customer whose marketing priority is 'unsubscribed'
 * (marketing_profile.priority). Per the product decision this includes customers
 * who also purchased — unsubscribe overrides everything. Soft delete only
 * (deleted_at set), so it's reversible via the customer module's restore.
 *
 * Once soft-deleted, these customers automatically drop out of query.graph
 * results — including the CSV export.
 */
export async function softDeleteUnsubscribedCustomers(
  container: MedusaContainer
): Promise<{ softDeleted: number }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customerModule: any = container.resolve(Modules.CUSTOMER)

  // Customers marked unsubscribed that are still live.
  const rows = (await pg("marketing_profile as mp")
    .join("customer as c", "c.id", "mp.customer_id")
    .whereNull("mp.deleted_at")
    .whereNull("c.deleted_at")
    .where("mp.priority", "unsubscribed")
    .select("mp.customer_id as id")) as { id: string }[]

  const ids = rows.map((r) => r.id)
  if (ids.length === 0) {
    return { softDeleted: 0 }
  }

  // Batch so a huge list doesn't build one oversized query.
  const BATCH = 200
  for (let i = 0; i < ids.length; i += BATCH) {
    await customerModule.softDeleteCustomers(ids.slice(i, i + BATCH))
  }

  logger.info(`[unsub-cleanup] Soft-deleted ${ids.length} unsubscribed customer(s).`)
  return { softDeleted: ids.length }
}
