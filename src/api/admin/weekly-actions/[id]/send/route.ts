import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { buildWeeklyActionEmail } from "../../../../../lib/email-templates/weekly-action/build"
import { sendCampaignEmail } from "../../../../../lib/ses/send"
import { upsertCustomerCampaign } from "../../../../../lib/customer-campaigns"
import { MARKETING_MODULE } from "../../../../../modules/marketing"

type Body = { customer_id?: string }

/**
 * POST /admin/weekly-actions/:id/send   { customer_id }
 * Renders the weekly action (:id) and emails it to the given customer via SES
 * (tracked under campaign_id = the weekly action id). Records the send in
 * customer_campaign so opens/clicks/bounces attach to it.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const weeklyActionId = req.params.id
  const customerId = (req.body?.customer_id ?? "").trim()
  if (!customerId) {
    return res.status(400).json({ message: "customer_id is required" })
  }

  // Resolve the customer's email.
  const customer = await pg("customer").where("id", customerId).whereNull("deleted_at").first("id", "email")
  if (!customer?.email) {
    return res.status(404).json({ message: "Customer not found or has no email" })
  }

  try {
    const { subject, html, productCount } = await buildWeeklyActionEmail(req.scope, {
      weeklyActionId,
    })

    const { messageId } = await sendCampaignEmail({
      to: customer.email,
      customerId,
      subject,
      html,
      campaignId: weeklyActionId,
    })

    // Record the send (source "ses"); opens/clicks will fill the same row.
    const marketing = req.scope.resolve(MARKETING_MODULE)
    await upsertCustomerCampaign(marketing, customerId, "ses", {
      campaign_id: weeklyActionId,
      sent_at: new Date().toISOString(),
    }).catch((e) => logger.warn(`[weekly-action send] record failed: ${(e as Error).message}`))

    logger.info(
      `[weekly-action send] "${subject}" (${productCount} products) → ${customer.email} (messageId=${messageId})`
    )
    return res.json({ ok: true, email: customer.email, subject, products: productCount, messageId })
  } catch (err) {
    const msg = (err as Error).message
    logger.error(`[weekly-action send] ${weeklyActionId} → ${customer.email} failed: ${msg}`)
    return res.status(502).json({ ok: false, message: `Send failed: ${msg}` })
  }
}
