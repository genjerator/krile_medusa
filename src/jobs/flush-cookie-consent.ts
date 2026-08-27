import { MedusaContainer } from "@medusajs/framework/types"
import { flushConsentToDb } from "../lib/cookie-consent"

/**
 * Moves completed days' cookie-consent tallies from Redis into the DB. Runs just
 * after midnight so the previous day is finalised; today's bucket keeps counting
 * in Redis until tomorrow's run.
 */
export default async function flushCookieConsentJob(container: MedusaContainer) {
  await flushConsentToDb(container)
}

export const config = {
  name: "flush-cookie-consent",
  schedule: "15 0 * * *", // 00:15 daily
}
