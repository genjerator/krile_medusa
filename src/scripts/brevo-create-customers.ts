import { ExecArgs } from "@medusajs/framework/types"
import { createMissingCustomersFromBrevo } from "../lib/brevo-sync"

/**
 * On-demand run of the "create customers from deliverable Brevo contacts" job,
 * for testing/diagnosis without waiting for the 15-minute schedule. Prints the
 * outcome (candidates found, created, already-existed, blacklisted, failed, and
 * any error messages) so you can see exactly why a customer was or wasn't made.
 *
 * Run:  pnpm medusa exec ./src/scripts/brevo-create-customers.js
 * Uses a wide 72h window so a recent test event is definitely in range.
 */
export default async function run({ container }: ExecArgs) {
  const stats = await createMissingCustomersFromBrevo(container, { sinceHours: 72 })
  console.log("[brevo-create] result:\n" + JSON.stringify(stats, null, 2))
}
