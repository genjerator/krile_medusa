import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETING_MODULE } from "../../../../../modules/marketing"

/**
 * GET /admin/customers/:id/ses-stats
 * Aggregates a customer's SES campaign engagement from customer_campaign
 * (source="ses") + the unsubscribe/last-engagement flags on marketing_profile.
 * Feeds the "SES E-Mail-Statistik" widget on the customer detail page — the SES
 * counterpart to the Brevo stats widget (which reads customer.metadata.brevo).
 */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const marketing: any = req.scope.resolve(MARKETING_MODULE)
  const customerId = req.params.id

  const campaigns = await marketing.listCustomerCampaigns(
    { customer_id: customerId, source: "ses" },
    { take: 500, order: { sent_at: "DESC" } }
  )

  const [profile] = await marketing.listMarketingProfiles({ customer_id: customerId }, { take: 1 })

  const sent = campaigns.filter((c: any) => c.sent_at).length
  const delivered = campaigns.filter((c: any) => c.delivered_at).length
  const opened = campaigns.filter((c: any) => c.opened_at).length
  const clicked = campaigns.filter((c: any) => c.clicked_at).length
  const bounced = campaigns.filter((c: any) => c.bounced_at).length
  const complained = campaigns.filter((c: any) => c.complained_at).length

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0)

  res.json({
    stats: {
      campaigns_total: campaigns.length,
      campaigns_sent: sent,
      campaigns_delivered: delivered,
      campaigns_opened: opened,
      campaigns_clicked: clicked,
      bounced,
      complained,
      open_rate: pct(opened, sent),
      click_rate: pct(clicked, sent),
      unsubscribed: !!profile?.unsubscribed,
      last_opened_at: profile?.last_opened_at ?? null,
      last_clicked_at: profile?.last_clicked_at ?? null,
    },
    // Most recent campaigns (already newest-first), trimmed for the widget table.
    recent: campaigns.slice(0, 15).map((c: any) => ({
      campaign_id: c.campaign_id,
      sent_at: c.sent_at,
      opened_at: c.opened_at,
      clicked_at: c.clicked_at,
      bounced_at: c.bounced_at,
    })),
  })
}
