import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { SEO_METRICS_MODULE } from "../../../../modules/seoMetrics"
import { SEO_BRANDS } from "../../../../lib/seo/brands"
import { parseRange, aggregateBreakdown } from "../../../../lib/seo/range"
import { pageToHandle } from "../../../../lib/seo/url"

/**
 * THE DIFFERENTIATOR: organic performance joined to revenue, per product.
 * Takes the top GSC/Bing landing pages, maps each URL → product handle, and joins
 * to orders/revenue for that product over the same range. This is the view no
 * generic SEO tool can produce — it only works because we're inside Medusa.
 *
 *   GET /admin/seo/products?brand=&from=&to=&source=gsc&limit=50
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve(SEO_METRICS_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const productModule: any = req.scope.resolve(Modules.PRODUCT)

  const brand = String(req.query.brand ?? SEO_BRANDS[0]?.key)
  const source = String(req.query.source ?? "gsc")
  const limit = Math.min(Number(req.query.limit) || 50, 500)
  const { from, to } = parseRange(req.query)

  // 1) Top pages, then collapse locale variants onto the product handle.
  const pageRows: any[] = await svc.listSeoPageDailies(
    { brand, source, date: { $gte: from, $lte: to } },
    { take: 1_000_000 }
  )
  const pages = aggregateBreakdown(pageRows, (r) => r.page, 5000)

  const byHandle = new Map<
    string,
    { handle: string; clicks: number; impressions: number; posNum: number; posDen: number }
  >()
  for (const p of pages) {
    const { type, handle } = pageToHandle(p.key)
    if (type !== "product" || !handle) continue
    const cur =
      byHandle.get(handle) ??
      { handle, clicks: 0, impressions: 0, posNum: 0, posDen: 0 }
    cur.clicks += p.clicks
    cur.impressions += p.impressions
    if (p.position != null) {
      cur.posNum += p.position * p.impressions
      cur.posDen += p.impressions
    }
    byHandle.set(handle, cur)
  }

  const handles = [...byHandle.keys()]
  if (!handles.length) {
    return res.json({ brand, source, from, to, rows: [] })
  }

  // 2) Resolve handles → products.
  const products: any[] = await productModule.listProducts(
    { handle: handles },
    { take: handles.length, select: ["id", "handle", "title", "thumbnail"] }
  )
  const productByHandle = new Map(products.map((p) => [p.handle, p]))
  const productIds = new Set(products.map((p) => p.id))

  // 3) Revenue per product from orders placed in the range.
  const fromIso = `${from}T00:00:00.000Z`
  const toIso = `${to}T23:59:59.999Z`
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "created_at", "status", "items.product_id", "items.total", "items.quantity"],
    filters: { created_at: { $gte: fromIso, $lte: toIso } } as any,
  })

  const revByProduct = new Map<string, { revenue: number; units: number; orders: Set<string> }>()
  for (const o of orders as any[]) {
    if (o.status === "canceled") continue
    for (const it of o.items ?? []) {
      if (!it.product_id || !productIds.has(it.product_id)) continue
      const cur =
        revByProduct.get(it.product_id) ?? { revenue: 0, units: 0, orders: new Set<string>() }
      cur.revenue += Number(it.total ?? 0)
      cur.units += Number(it.quantity ?? 0)
      cur.orders.add(o.id)
      revByProduct.set(it.product_id, cur)
    }
  }

  // 4) Assemble, sorted by organic clicks desc.
  const rows = [...byHandle.values()]
    .map((h) => {
      const product = productByHandle.get(h.handle)
      const rev = product ? revByProduct.get(product.id) : undefined
      return {
        handle: h.handle,
        product_id: product?.id ?? null,
        title: product?.title ?? h.handle,
        thumbnail: product?.thumbnail ?? null,
        clicks: h.clicks,
        impressions: h.impressions,
        ctr: h.impressions > 0 ? h.clicks / h.impressions : 0,
        position: h.posDen > 0 ? h.posNum / h.posDen : null,
        orders: rev?.orders.size ?? 0,
        units: rev?.units ?? 0,
        revenue: rev?.revenue ?? 0,
      }
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit)

  res.json({ brand, source, from, to, rows })
}
