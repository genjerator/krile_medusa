import { getGoogleAccessToken } from "./google-auth"

/**
 * GA4 Data API v1 (`runReport`) — daily overview metrics per property. We pull a
 * date-keyed report and normalise it into our metric_type rows. Called by the
 * ingestion step; failures bubble up to be logged there.
 */

const GA4_METRICS = [
  { api: "activeUsers", type: "users" },
  { api: "newUsers", type: "new_users" },
  { api: "sessions", type: "sessions" },
  { api: "engagedSessions", type: "engaged_sessions" },
] as const

export type Ga4DailyRow = { date: string; metric_type: string; value: number }

const toIsoDay = (ga4Date: string) =>
  `${ga4Date.slice(0, 4)}-${ga4Date.slice(4, 6)}-${ga4Date.slice(6, 8)}`

export async function fetchGa4Daily(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<Ga4DailyRow[]> {
  const token = await getGoogleAccessToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: GA4_METRICS.map((m) => ({ name: m.api })),
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 100000,
      }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GA4 runReport ${res.status}: ${body.slice(0, 300)}`)
  }

  const data: any = await res.json()
  const out: Ga4DailyRow[] = []
  for (const row of data.rows ?? []) {
    const date = toIsoDay(row.dimensionValues?.[0]?.value ?? "")
    GA4_METRICS.forEach((m, i) => {
      const value = Number(row.metricValues?.[i]?.value ?? 0)
      out.push({ date, metric_type: m.type, value })
    })
  }
  return out
}
