import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Returns the currently *active* weekly action (the one toggled on in the admin)
 * plus the product IDs it contains, or `null` when none is active. The storefront
 * fetches the products themselves through the normal pricing-aware product list
 * (by these IDs), so the "was/now" sale UI renders from the campaign's Price List.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Activation is manual: return the single action toggled active in the admin
  // (its sale Price List is live). When none is active, the storefront hides it.
  const { data: actions } = await query.graph({
    entity: "weekly_action",
    fields: [
      "id",
      "title",
      "year",
      "iso_week",
      "starts_at",
      "ends_at",
      "status",
      "items.product_id",
    ],
    // `as any`: `is_active` is a new model field; the generated query filter
    // types pick it up on the next backend start (`--types`).
    filters: {
      status: "planned",
      is_active: true,
    } as any,
  })

  if (!actions.length) {
    return res.json({ weekly_action: null, product_ids: [] })
  }

  const action: any = actions[0]
  const product_ids = (action.items ?? []).map((i: any) => i.product_id)

  return res.json({
    weekly_action: {
      id: action.id,
      title: action.title,
      year: action.year,
      iso_week: action.iso_week,
      starts_at: action.starts_at,
      ends_at: action.ends_at,
    },
    product_ids,
  })
}
