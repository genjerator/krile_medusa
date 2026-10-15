import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  QueryContext,
} from "@medusajs/framework/utils"

// Returns a single product by handle REGARDLESS of its status (published OR
// draft), including the `status` field so the storefront can render a draft as a
// read-only preview: viewable via a direct link, but NOT orderable (no
// "In den Warenkorb" button).
//
// The core /store/products route hard-filters status=published (see
// @medusajs/medusa .../store/products/middlewares), so drafts are invisible in
// all listings and search. This is a deliberate, narrow escape hatch for
// direct-link previews only — it is never used for listing/search, so drafts
// stay out of those surfaces.
//
// Pricing: calculated_price is derived from the variants' price sets (independent
// of product status), so passing the storefront's region/currency as a
// QueryContext lets a draft preview show the same prices a published product
// would. No schema change — this is a read-only query route.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const handle = req.params.handle

  const regionId = (req.query.region_id as string) || undefined
  const currencyCode = (req.query.currency_code as string) || undefined

  const requested = ((req.query.fields as string) || "").split(",").map((f) => f.trim()).filter(Boolean)
  const fields = Array.from(
    new Set<string>([
      "id",
      "title",
      "subtitle",
      "handle",
      "status",
      "thumbnail",
      "description",
      "*variants.calculated_price",
      ...requested,
    ])
  )

  const context: Record<string, unknown> = {}
  if (regionId || currencyCode) {
    context.variants = {
      calculated_price: QueryContext({
        region_id: regionId,
        currency_code: currencyCode,
      }),
    }
  }

  const { data } = await query.graph({
    entity: "product",
    fields,
    filters: { handle },
    pagination: { take: 1, skip: 0 },
    context,
  })

  const product = data?.[0] ?? null
  if (!product) {
    return res.status(404).json({ message: "Product not found" })
  }

  res.json({ product })
}
