import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_METRICS_MODULE } from "../../../../modules/seoMetrics"
import { SEO_BRANDS } from "../../../../lib/seo/brands"
import { parseRange, aggregateBreakdown } from "../../../../lib/seo/range"

/**
 * Top landing pages for a brand over a range.
 *   GET /admin/seo/pages?brand=&from=&to=&source=gsc&limit=100
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve(SEO_METRICS_MODULE)

  const brand = String(req.query.brand ?? SEO_BRANDS[0]?.key)
  const source = String(req.query.source ?? "gsc")
  const limit = Math.min(Number(req.query.limit) || 100, 1000)
  const { from, to } = parseRange(req.query)

  const rows: any[] = await svc.listSeoPageDailies(
    { brand, source, date: { $gte: from, $lte: to } },
    { take: 1_000_000 }
  )

  const pages = aggregateBreakdown(rows, (r) => r.page, limit)
  res.json({ brand, source, from, to, pages })
}
