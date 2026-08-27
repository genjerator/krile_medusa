/** Shared date-range parsing + aggregation helpers for the SEO admin routes. */

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

export type DateRange = { from: string; to: string; prevFrom: string; prevTo: string }

/**
 * Parses `from`/`to` (YYYY-MM-DD) with a sensible default (last 28 days) and
 * computes the equal-length immediately-preceding period for deltas.
 */
export function parseRange(q: Record<string, any>): DateRange {
  const to = typeof q.to === "string" && q.to ? q.to : isoDay(new Date())
  const from =
    typeof q.from === "string" && q.from
      ? q.from
      : isoDay(new Date(Date.now() - 27 * 86_400_000))

  const fromMs = Date.parse(from)
  const toMs = Date.parse(to)
  const spanMs = Math.max(0, toMs - fromMs)
  const dayMs = 86_400_000
  const prevTo = isoDay(new Date(fromMs - dayMs))
  const prevFrom = isoDay(new Date(fromMs - dayMs - spanMs))
  return { from, to, prevFrom, prevTo }
}

export const inRange = (date: string, from: string, to: string) => date >= from && date <= to

/** % change old→new; null when there's no baseline. */
export const pctDelta = (curr: number, prev: number): number | null =>
  prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : null

/**
 * Group query/page breakdown rows by their key over a range: sum clicks &
 * impressions, derive CTR, and average position weighted by impressions. Sorted
 * by clicks desc.
 */
export function aggregateBreakdown(
  rows: { clicks: number; impressions: number; position: number | null }[],
  keyOf: (r: any) => string,
  limit = 100
) {
  const acc = new Map<
    string,
    { key: string; clicks: number; impressions: number; posNum: number; posDen: number }
  >()
  for (const r of rows) {
    const key = keyOf(r)
    if (!key) continue
    const cur =
      acc.get(key) ?? { key, clicks: 0, impressions: 0, posNum: 0, posDen: 0 }
    cur.clicks += r.clicks
    cur.impressions += r.impressions
    if (r.position != null) {
      cur.posNum += r.position * r.impressions
      cur.posDen += r.impressions
    }
    acc.set(key, cur)
  }
  return [...acc.values()]
    .map((a) => ({
      key: a.key,
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: a.impressions > 0 ? a.clicks / a.impressions : 0,
      position: a.posDen > 0 ? a.posNum / a.posDen : null,
    }))
    .sort((x, y) => y.clicks - x.clicks)
    .slice(0, limit)
}

/**
 * Aggregate metric_daily rows into per-source KPIs. Sums additive metrics;
 * derives GSC CTR from clicks/impressions and averages position weighted by
 * daily impressions (position is stored per-day as GSC's own average).
 */
export function aggregateKpis(
  rows: { source: string; date: string; metric_type: string; value: number }[]
) {
  const sum = (source: string, type: string) =>
    rows
      .filter((r) => r.source === source && r.metric_type === type)
      .reduce((a, r) => a + r.value, 0)

  // Impression-weighted GSC position.
  const posRows = rows.filter((r) => r.source === "gsc" && r.metric_type === "position")
  const imprByDate = new Map<string, number>()
  rows
    .filter((r) => r.source === "gsc" && r.metric_type === "impressions")
    .forEach((r) => imprByDate.set(r.date, r.value))
  let posNum = 0
  let posDen = 0
  for (const r of posRows) {
    const w = imprByDate.get(r.date) ?? 0
    posNum += r.value * w
    posDen += w
  }

  const gscClicks = sum("gsc", "clicks")
  const gscImpr = sum("gsc", "impressions")

  return {
    ga4: {
      users: sum("ga4", "users"),
      new_users: sum("ga4", "new_users"),
      sessions: sum("ga4", "sessions"),
    },
    gsc: {
      clicks: gscClicks,
      impressions: gscImpr,
      ctr: gscImpr > 0 ? gscClicks / gscImpr : 0,
      position: posDen > 0 ? posNum / posDen : null,
    },
    bing: {
      clicks: sum("bing", "clicks"),
      impressions: sum("bing", "impressions"),
    },
  }
}
