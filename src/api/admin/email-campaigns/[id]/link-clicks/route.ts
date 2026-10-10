import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../../../../modules/marketing"

/**
 * GET /admin/email-campaigns/:id/link-clicks
 * Per-LINK click report for the whole campaign — which URLs in the email were
 * clicked, across all of its group-sends. Aggregates `ses_event_log` Click events
 * whose campaign_id tag is any of the campaign's group-send batch ids, grouped by
 * link: total clicks + distinct recipients, most-clicked first.
 *
 * Note (design doc R3): email scanners / Apple MPP can auto-click, so raw clicks
 * are directional — `unique_recipients` is the more honest signal.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const id = req.params.id

  const campaign = await marketing.retrieveEmailCampaign(id).catch(() => null)
  if (!campaign) return res.status(404).json({ message: "Campaign not found" })

  const batchIds: string[] = (
    await pg("ses_batch").where({ campaign_id: id }).whereNull("deleted_at").select("id")
  ).map((b: any) => b.id)

  if (!batchIds.length) {
    return res.json({ links: [], total_clicks: 0, unique_clickers: 0 })
  }

  const base = () =>
    pg("ses_event_log")
      .where("event", "Click")
      .whereNotNull("link")
      .whereNull("deleted_at")
      .whereIn("campaign_id", batchIds)

  const links = await base()
    .select("link")
    .count("* as clicks")
    .countDistinct("email as unique_recipients")
    .groupBy("link")
    .orderBy("clicks", "desc")

  const [totals] = await base().count("* as total_clicks").countDistinct("email as unique_clickers")

  res.json({
    links: (links as any[]).map((r) => ({
      link: r.link,
      clicks: Number(r.clicks),
      unique_recipients: Number(r.unique_recipients),
    })),
    total_clicks: Number((totals as any)?.total_clicks ?? 0),
    unique_clickers: Number((totals as any)?.unique_clickers ?? 0),
  })
}
