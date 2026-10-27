import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { computeCampaignConversion } from "../../../lib/campaign-conversion"

/**
 * GET /admin/marketing-conversion
 * Order conversion across ALL marketing-email recipients (every campaign): how
 * many distinct customers who received at least one email went on to place an
 * order afterwards, and the revenue those orders represent. See
 * `lib/campaign-conversion` for the attribution rule. Read-only.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const recRows = (await pg("customer_campaign as cc")
    .join("customer as c", "c.id", "cc.customer_id")
    .where("cc.source", "ses")
    .whereNull("cc.deleted_at")
    .whereNotNull("cc.delivered_at")
    .whereNotNull("c.email")
    .groupBy("c.email")
    .select("c.email as email")
    .min("cc.delivered_at as first_delivered")) as {
    email: string
    first_delivered: string
  }[]

  const conversion = await computeCampaignConversion(req.scope, recRows)
  res.json(conversion)
}
