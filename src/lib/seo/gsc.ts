import { getGoogleAccessToken } from "./google-auth"

/**
 * Google Search Console — Search Analytics API (`searchAnalytics.query`).
 * Three pulls per brand: a date-keyed metric series (for KPI/trend), and
 * date×query / date×page breakdowns (top queries/pages, cached with real daily
 * granularity so the UI can aggregate over any range). GSC data lags ~2–3 days,
 * so ingestion re-pulls a trailing window each run.
 */

const ROW_LIMIT = 25000

async function query(site: string, body: Record<string, unknown>): Promise<any> {
  const token = await getGoogleAccessToken()
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      site
    )}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`GSC query ${res.status}: ${t.slice(0, 300)}`)
  }
  return res.json()
}

export type GscMetricRow = { date: string; metric_type: string; value: number }
export type GscBreakdownRow = {
  date: string
  key: string // query text or page url
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/** Daily totals → clicks / impressions / ctr / position metric rows. */
export async function fetchGscDailyMetrics(
  site: string,
  startDate: string,
  endDate: string
): Promise<GscMetricRow[]> {
  const data = await query(site, {
    startDate,
    endDate,
    dimensions: ["date"],
    rowLimit: ROW_LIMIT,
  })
  const out: GscMetricRow[] = []
  for (const r of data.rows ?? []) {
    const date = r.keys?.[0]
    if (!date) continue
    out.push({ date, metric_type: "clicks", value: Number(r.clicks ?? 0) })
    out.push({ date, metric_type: "impressions", value: Number(r.impressions ?? 0) })
    out.push({ date, metric_type: "ctr", value: Number(r.ctr ?? 0) })
    out.push({ date, metric_type: "position", value: Number(r.position ?? 0) })
  }
  return out
}

/** date × <dimension> breakdown (dimension = "query" or "page"). */
async function fetchGscBreakdown(
  site: string,
  startDate: string,
  endDate: string,
  dimension: "query" | "page"
): Promise<GscBreakdownRow[]> {
  const data = await query(site, {
    startDate,
    endDate,
    dimensions: ["date", dimension],
    rowLimit: ROW_LIMIT,
  })
  return (data.rows ?? []).map((r: any) => ({
    date: r.keys?.[0],
    key: r.keys?.[1] ?? "",
    clicks: Number(r.clicks ?? 0),
    impressions: Number(r.impressions ?? 0),
    ctr: Number(r.ctr ?? 0),
    position: Number(r.position ?? 0),
  }))
}

export const fetchGscQueries = (site: string, s: string, e: string) =>
  fetchGscBreakdown(site, s, e, "query")

export const fetchGscPages = (site: string, s: string, e: string) =>
  fetchGscBreakdown(site, s, e, "page")
