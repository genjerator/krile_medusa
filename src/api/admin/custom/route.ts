import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/custom?view=test-recipients
 * Returns customers tagged `marketing_profile.user_type = 'test'` (the campaign
 * test audience). Lives on the pre-existing `custom` route because `medusa build`
 * on this project is not registering newly-added top-level API route folders
 * (see docs/ses-campaign-email-system.md — build quirk).
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const view = typeof req.query.view === "string" ? req.query.view : ""
  if (view !== "test-recipients") {
    return res.sendStatus(200)
  }

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const rows = await pg("marketing_profile as mp")
    .join("customer as c", "c.id", "mp.customer_id")
    .whereNull("mp.deleted_at")
    .whereNull("c.deleted_at")
    .where("mp.user_type", "test")
    .select(
      "c.id as id",
      "c.email as email",
      "c.first_name as first_name",
      "c.last_name as last_name",
      "mp.user_type as user_type",
      "mp.unsubscribed as unsubscribed"
    )
    .orderBy("c.email")

  res.json({ test_users: rows, count: rows.length })
}
