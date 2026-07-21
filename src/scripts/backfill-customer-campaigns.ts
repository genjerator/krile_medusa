import { ExecArgs } from "@medusajs/framework/types"
import { backfillCustomerCampaignsFromMetadata } from "../lib/customer-campaigns"

/**
 * One-time move of campaign ids from customer.metadata.brevo.sent_campaign_ids
 * into the customer_campaign table.
 *
 * Run:  pnpm medusa exec ./src/scripts/backfill-customer-campaigns.js
 */
export default async function run({ container }: ExecArgs) {
  const stats = await backfillCustomerCampaignsFromMetadata(container)
  console.log("[campaign-backfill] result: " + JSON.stringify(stats))
}
