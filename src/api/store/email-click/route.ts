import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../modules/marketing"
import { upsertCustomerCampaign } from "../../../lib/customer-campaigns"
import { logSesEvent } from "../../../lib/ses/ses-event-log"

type Body = { cmp?: string; rcp?: string; url?: string }

/**
 * POST /store/email-click  { cmp, rcp, url }
 *
 * First-party email click beacon. The storefront middleware fires this when an
 * incoming request carries the email's `cmp`/`rcp` params, so clicks are tracked
 * on OUR domain instead of SES's awstrack.me wrapper (ad-blockers kill that).
 *
 * It records two things, both idempotently:
 *   1. `clicked_at` on the matching customer_campaign row (source "ses",
 *      campaign_id=cmp, customer_id=rcp) — the row the SES Click event filled, so
 *      the stats dashboard is unchanged.
 *   2. a `ses_event_log` Click row { email, campaign_id: cmp, link: url } — the
 *      exact shape the SES Click event wrote, so the per-link report keeps working.
 *      Skipped if an identical (email, campaign_id, link) Click already exists.
 *
 * Best-effort: always returns 204, never throws.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { cmp, rcp, url } = (req.body ?? {}) as Body
  const campaignId = (cmp ?? "").trim()
  const customerId = (rcp ?? "").trim()
  const link = (url ?? "").trim()

  if (campaignId && customerId) {
    try {
      const marketing: any = req.scope.resolve(MARKETING_MODULE)

      // 1) clicked_at (fills only if missing)
      await upsertCustomerCampaign(marketing, customerId, "ses", {
        campaign_id: campaignId,
        clicked_at: new Date().toISOString(),
      })

      // 2) per-link Click row (so the link-clicks report keeps working)
      if (link) {
        const pg: any = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
        const customerModule: any = req.scope.resolve(Modules.CUSTOMER)
        const [customer] = await customerModule.listCustomers(
          { id: customerId },
          { select: ["email"], take: 1 }
        )
        const email = customer?.email ?? null

        const dupe = await pg("ses_event_log")
          .where({ event: "Click", campaign_id: campaignId, link })
          .modify((q: any) => (email ? q.where({ email }) : q.whereNull("email")))
          .whereNull("deleted_at")
          .first("id")

        if (!dupe) {
          await logSesEvent(req.scope, {
            event: "Click",
            email,
            message_id: null,
            campaign_id: campaignId,
            link,
            matched: true,
            payload: { source: "first-party", rcp: customerId },
          })
        }
      }
    } catch {
      // best-effort: never fail the beacon
    }
  }

  res.status(204).send("")
}
