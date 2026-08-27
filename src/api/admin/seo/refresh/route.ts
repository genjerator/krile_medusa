import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runSeoIngestion } from "../../../../lib/seo/ingest"
import { hasGoogleCreds } from "../../../../lib/seo/google-auth"

/**
 * On-demand ingestion trigger for the admin "Refresh" button.
 *   POST /admin/seo/refresh  { brandKeys?: string[], days?: number }
 * Runs the same pull as the daily job and returns a per-source result summary.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  if (!hasGoogleCreds()) {
    return res.status(400).json({
      message: "SEO_GOOGLE_SA_JSON is not configured — cannot pull GA4/GSC.",
    })
  }

  const body = (req.body ?? {}) as { brandKeys?: string[]; days?: number }
  const results = await runSeoIngestion(req.scope, {
    brandKeys: Array.isArray(body.brandKeys) ? body.brandKeys : undefined,
    days: typeof body.days === "number" ? body.days : 30,
  })

  res.json({ ok: true, results })
}
