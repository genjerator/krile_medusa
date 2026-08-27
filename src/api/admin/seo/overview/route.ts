import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEO_METRICS_MODULE } from "../../../../modules/seoMetrics"
import { SEO_BRANDS } from "../../../../lib/seo/brands"
import { parseRange, aggregateKpis, pctDelta } from "../../../../lib/seo/range"

/**
 * KPI overview for a brand over a date range, with period-over-period deltas and
 * a daily series for the trend chart.
 *   GET /admin/seo/overview?brand=industries&from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve(SEO_METRICS_MODULE)

  const brand = String(req.query.brand ?? SEO_BRANDS[0]?.key)
  const { from, to, prevFrom, prevTo } = parseRange(req.query)

  const rows: any[] = await svc.listSeoMetricDailies(
    { brand, date: { $gte: prevFrom, $lte: to } },
    { take: 1_000_000 }
  )

  const curr = rows.filter((r) => r.date >= from && r.date <= to)
  const prev = rows.filter((r) => r.date >= prevFrom && r.date <= prevTo)

  const kpis = aggregateKpis(curr)
  const prevKpis = aggregateKpis(prev)

  // Flat deltas (% change) for the cards.
  const deltas = {
    ga4: {
      users: pctDelta(kpis.ga4.users, prevKpis.ga4.users),
      new_users: pctDelta(kpis.ga4.new_users, prevKpis.ga4.new_users),
      sessions: pctDelta(kpis.ga4.sessions, prevKpis.ga4.sessions),
    },
    gsc: {
      clicks: pctDelta(kpis.gsc.clicks, prevKpis.gsc.clicks),
      impressions: pctDelta(kpis.gsc.impressions, prevKpis.gsc.impressions),
      ctr: pctDelta(kpis.gsc.ctr, prevKpis.gsc.ctr),
      position: pctDelta(prevKpis.gsc.position ?? 0, kpis.gsc.position ?? 0), // lower is better → invert
    },
    bing: {
      clicks: pctDelta(kpis.bing.clicks, prevKpis.bing.clicks),
      impressions: pctDelta(kpis.bing.impressions, prevKpis.bing.impressions),
    },
  }

  // Daily series for the trend chart.
  const byDate = new Map<string, any>()
  for (const r of curr) {
    if (!byDate.has(r.date)) {
      byDate.set(r.date, {
        date: r.date,
        ga4_users: 0,
        gsc_clicks: 0,
        gsc_impressions: 0,
        bing_clicks: 0,
      })
    }
    const d = byDate.get(r.date)
    if (r.source === "ga4" && r.metric_type === "users") d.ga4_users = r.value
    if (r.source === "gsc" && r.metric_type === "clicks") d.gsc_clicks = r.value
    if (r.source === "gsc" && r.metric_type === "impressions") d.gsc_impressions = r.value
    if (r.source === "bing" && r.metric_type === "clicks") d.bing_clicks = r.value
  }
  const series = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1))

  res.json({ brand, from, to, kpis, deltas, series })
}
