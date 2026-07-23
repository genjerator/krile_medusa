import { ExecArgs } from "@medusajs/framework/types"
import { recomputeMarketingPriorities } from "../lib/marketing-priority"
import { softDeleteUnsubscribedCustomers } from "../lib/soft-delete-unsubscribed"

/**
 * On-demand: recompute priorities, then soft-delete every 'unsubscribed'
 * customer (same as the nightly job). Recompute first so the priority reflects
 * the current metadata before we act on it.
 *
 * Run:  pnpm medusa exec ./src/scripts/soft-delete-unsubscribed.js
 */
export default async function run({ container }: ExecArgs) {
  const breakdown = await recomputeMarketingPriorities(container)
  const { softDeleted } = await softDeleteUnsubscribedCustomers(container)
  console.log(
    "[unsub-cleanup] priorities: " +
      JSON.stringify(breakdown) +
      ` | soft-deleted: ${softDeleted}`
  )
}
