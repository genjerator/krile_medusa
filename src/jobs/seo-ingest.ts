import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runSeoIngestion } from "../lib/seo/ingest"
import { hasGoogleCreds } from "../lib/seo/google-auth"

/**
 * Daily SEO ingestion: pulls GA4 + GSC (+ Bing if keyed) for all configured
 * brands into the seoMetrics cache tables. Re-pulls a trailing window to absorb
 * GSC's 2–3 day lag. No-op when Google credentials aren't configured.
 */
export default async function seoIngestJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!hasGoogleCreds()) {
    logger.info("[seo-ingest] SEO_GOOGLE_SA_JSON not set — skipping scheduled ingestion.")
    return
  }

  await runSeoIngestion(container, { days: 30 })
}

export const config = {
  name: "seo-ingest",
  // 05:30 daily — after GSC's data settles for the prior days.
  schedule: "30 5 * * *",
}
