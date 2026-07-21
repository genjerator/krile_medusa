import { ExecArgs } from "@medusajs/framework/types"
import { recomputeMarketingPriorities } from "../lib/marketing-priority"

/**
 * On-demand marketing-priority recompute (same as the nightly job), for
 * testing or an immediate refresh.
 *
 * Run:  pnpm medusa exec ./src/scripts/recompute-marketing-priority.js
 */
export default async function run({ container }: ExecArgs) {
  const breakdown = await recomputeMarketingPriorities(container)
  console.log("[marketing-priority] breakdown: " + JSON.stringify(breakdown))
}
