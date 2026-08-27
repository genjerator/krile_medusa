import { ExecArgs } from "@medusajs/framework/types"
import { flushConsentToDb } from "../lib/cookie-consent"

/**
 * Manually flush cookie-consent tallies from Redis into the DB — including
 * today's still-running bucket (which the scheduled job intentionally leaves
 * alone until the day is complete). For testing / on-demand use.
 *
 * Run: npx medusa exec ./src/scripts/flush-cookie-consent-now.ts
 */
export default async function run({ container }: ExecArgs) {
  const res = await flushConsentToDb(container, { includeToday: true })
  console.log(`COOKIE FLUSH DONE: moved ${res.flushed} day-bucket(s) to DB.`)
}
