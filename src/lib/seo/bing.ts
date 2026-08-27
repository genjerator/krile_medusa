/**
 * Bing Webmaster API (JSON over HTTP, `?apikey=`). Lower-volume and shaped
 * differently from GSC: rank/traffic is a daily series, while query/page stats
 * are rolling aggregates (no per-day dimension) — we snapshot those against the
 * run's end date. The API key is account-scoped, so it's passed per brand.
 */

const BASE = "https://ssl.bing.com/webmaster/api.svc/json"

async function call(method: string, siteUrl: string, apiKey: string): Promise<any[]> {
  if (!apiKey) return []
  const url = `${BASE}/${method}?apikey=${encodeURIComponent(
    apiKey
  )}&siteUrl=${encodeURIComponent(siteUrl)}`
  const res = await fetch(url, { method: "GET" })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Bing ${method} ${res.status}: ${t.slice(0, 300)}`)
  }
  const data: any = await res.json()
  return data?.d ?? []
}

// Bing serialises dates as WCF "/Date(1610000000000)/".
const parseWcfDate = (s: string | undefined): string | null => {
  if (!s) return null
  const m = /\/Date\((\d+)/.exec(s)
  if (!m) return null
  return new Date(Number(m[1])).toISOString().slice(0, 10)
}

export type BingMetricRow = { date: string; metric_type: string; value: number }
export type BingBreakdownRow = {
  key: string
  clicks: number
  impressions: number
  position: number | null
}

/** Daily clicks/impressions series from GetRankAndTrafficStats. */
export async function fetchBingDailyMetrics(siteUrl: string, apiKey: string): Promise<BingMetricRow[]> {
  const rows = await call("GetRankAndTrafficStats", siteUrl, apiKey)
  const out: BingMetricRow[] = []
  for (const r of rows) {
    const date = parseWcfDate(r.Date)
    if (!date) continue
    out.push({ date, metric_type: "clicks", value: Number(r.Clicks ?? 0) })
    out.push({ date, metric_type: "impressions", value: Number(r.Impressions ?? 0) })
  }
  return out
}

const mapBreakdown = (rows: any[], keyField: string): BingBreakdownRow[] =>
  rows.map((r) => ({
    key: r[keyField] ?? "",
    clicks: Number(r.Clicks ?? 0),
    impressions: Number(r.Impressions ?? 0),
    position: r.AvgImpressionPosition != null ? Number(r.AvgImpressionPosition) : null,
  }))

export async function fetchBingQueries(siteUrl: string, apiKey: string): Promise<BingBreakdownRow[]> {
  return mapBreakdown(await call("GetQueryStats", siteUrl, apiKey), "Query")
}

export async function fetchBingPages(siteUrl: string, apiKey: string): Promise<BingBreakdownRow[]> {
  return mapBreakdown(await call("GetPageStats", siteUrl, apiKey), "Query") // GetPageStats returns the URL in "Query"
}
