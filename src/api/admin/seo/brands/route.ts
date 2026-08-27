import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_BRANDS, bingConfigured } from "../../../../lib/seo/brands"
import { hasGoogleCreds } from "../../../../lib/seo/google-auth"

/**
 * Configured brands + which sources are wired up, for the admin brand switcher
 * and "not configured" hints.
 *   GET /admin/seo/brands
 */
export async function GET(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const google = hasGoogleCreds()

  res.json({
    google_configured: google,
    bing_configured: bingConfigured(),
    brands: SEO_BRANDS.map((b) => ({
      key: b.key,
      label: b.label,
      sources: {
        ga4: google && Boolean(b.ga4_property_id),
        gsc: google && Boolean(b.gsc_site),
        bing: Boolean(b.bing_api_key && b.bing_site),
      },
    })),
  })
}
