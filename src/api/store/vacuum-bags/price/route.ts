import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Authoritative live price for one chosen combination.
 *   GET /store/vacuum-bags/price?type=std-90&width=200&height=300
 * Returns `{ available: true, price, currency_code, pack_size }` on an exact
 * matrix hit, or `{ available: false }` when the combination has no active row
 * ("auf Anfrage"). Price is colour-independent — exact lookup by (type, width,
 * height). A `color` query param is accepted but ignored (cosmetic only).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const type = String(req.query.type ?? "").trim()
  const width_mm = Number(req.query.width)
  const height_mm = Number(req.query.height)

  if (
    !type ||
    !Number.isFinite(width_mm) ||
    !Number.isFinite(height_mm)
  ) {
    return res.status(400).json({
      message: "type, width and height are all required (width/height numeric).",
    })
  }

  const { data: rows } = await query.graph({
    entity: "vacuum_bag_price",
    fields: ["price", "currency_code", "type.slug"],
    filters: {
      width_mm,
      height_mm,
      active: true,
      type: { slug: type },
    } as any,
  })

  const row: any = rows[0]
  if (!row) {
    return res.json({ available: false })
  }

  const { data: configs } = await query.graph({
    entity: "vacuum_bag_config",
    fields: ["pack_size"],
    filters: { active: true } as any,
  })

  return res.json({
    available: true,
    price: row.price,
    currency_code: row.currency_code,
    pack_size: (configs[0] as any)?.pack_size ?? 1000,
  })
}
