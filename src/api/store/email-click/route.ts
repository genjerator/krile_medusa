import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETING_MODULE } from "../../../modules/marketing"
import { upsertCustomerCampaign } from "../../../lib/customer-campaigns"

type Body = { cmp?: string; rcp?: string }

/**
 * POST /store/email-click  { cmp, rcp }
 *
 * First-party email click beacon. The storefront middleware fires this when an
 * incoming request carries the email's `cmp`/`rcp` params, so clicks are tracked
 * on OUR domain instead of SES's awstrack.me wrapper (which ad-blockers kill).
 *
 * It fills `clicked_at` on the matching `customer_campaign` row
 * (source "ses", campaign_id=cmp, customer_id=rcp) — the exact row the SES Click
 * event would have filled, so campaign stats read identically. Best-effort and
 * idempotent (only fills a missing timestamp); always returns 204.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cmp, rcp } = (req.body ?? {}) as Body
  const campaignId = (cmp ?? "").trim()
  const customerId = (rcp ?? "").trim()

  if (campaignId && customerId) {
    try {
      const marketing: any = req.scope.resolve(MARKETING_MODULE)
      await upsertCustomerCampaign(marketing, customerId, "ses", {
        campaign_id: campaignId,
        clicked_at: new Date().toISOString(),
      })
    } catch {
      // best-effort: never fail the beacon
    }
  }

  res.status(204).send("")
}
