import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Authoritative live price for one chosen combination.
 *   GET /store/vacuum-bags/price?color=transparent&thickness=90&width=200&height=300
 * Returns `{ available: true, price, currency_code, pack_size }` on an exact
 * matrix hit, or `{ available: false }` when the combination has no active row
 * ("auf Anfrage"). Exact lookup by the four keys — no computation.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const color = String(req.query.color ?? "").trim()
  const thickness_um = Number(req.query.thickness)
  const width_mm = Number(req.query.width)
  const height_mm = Number(req.query.height)

  if (
    !color ||
    !Number.isFinite(thickness_um) ||
    !Number.isFinite(width_mm) ||
    !Number.isFinite(height_mm)
  ) {
    return res.status(400).json({
      message:
        "color, thickness, width and height are all required (thickness/width/height numeric).",
    })
  }

  const { data: rows } = await query.graph({
    entity: "vacuum_bag_price",
    fields: ["price", "currency_code", "color.slug"],
    filters: {
      thickness_um,
      width_mm,
      height_mm,
      active: true,
      color: { slug: color },
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
