import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/ses-link-clicks?campaign_id=<id>
 * Per-LINK click report from `ses_event_log` (event = 'Click'). For the given
 * campaign (the SES campaign_id tag = the weekly-action id / source_id), returns
 * each clicked URL with its total clicks and how many distinct recipients clicked
 * it, most-clicked first — "track each link clicked in the email".
 *
 * Without campaign_id it aggregates across all SES clicks. Note (R3 in the design
 * doc): security scanners / Apple MPP can auto-click links, so treat raw click
 * counts as directional; `unique_recipients` is the more honest signal.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const campaignId = typeof req.query.campaign_id === "string" ? req.query.campaign_id.trim() : ""

  const base = () => {
    const q = pg("ses_event_log")
      .where("event", "Click")
      .whereNotNull("link")
      .whereNull("deleted_at")
    if (campaignId) q.where("campaign_id", campaignId)
    return q
  }

  const links = await base()
    .select("link")
    .count("* as clicks")
    .countDistinct("email as unique_recipients")
    .groupBy("link")
    .orderBy("clicks", "desc")

  const [totals] = await base().count("* as total_clicks").countDistinct("email as unique_clickers")

  res.json({
    campaign_id: campaignId || null,
    links: (links as any[]).map((r) => ({
      link: r.link,
      clicks: Number(r.clicks),
      unique_recipients: Number(r.unique_recipients),
    })),
    total_clicks: Number((totals as any)?.total_clicks ?? 0),
    unique_clickers: Number((totals as any)?.unique_clickers ?? 0),
  })
}
