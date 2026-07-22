import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Dashboard metrics: current-month KPIs + a 6-month orders/revenue trend.
 *
 * - Revenue = gross order total (sum of `order.total`), EUR (single-currency shop).
 * - Order scope = "real" orders only: drafts and canceled orders are excluded.
 * - Amounts are stored as-is in Medusa (49.99 = 49.99, not cents).
 */

const EXCLUDED_STATUSES = new Set(["canceled", "draft"])

// Internal / test accounts — their orders and customer records are excluded
// from all dashboard stats.
const EXCLUDED_EMAILS = [
  "genjerator@outlook.com",
  "e.medjesi@gmail.com",
  "kt@planeta.de",
  "jt@planeta.de",
  "info@planeta.de",
  "info@planeta-shop.de",
]
const EXCLUDED_EMAIL_SET = new Set(EXCLUDED_EMAILS.map((e) => e.toLowerCase()))
const normEmail = (v: unknown) => String(v ?? "").trim().toLowerCase()

const round2 = (n: number) => Math.round(n * 100) / 100
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  // First day of the month 5 months ago → a 6-bucket window incl. the current month.
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)
  // Fetch far enough back to cover both the 6-month chart and year-to-date.
  const fetchStart = windowStart < yearStart ? windowStart : yearStart

  // Orders since fetchStart (40s of rows here; take a generous page).
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "status", "created_at", "email"],
    filters: { created_at: { $gte: fetchStart.toISOString() } } as any,
    pagination: { take: 10000, skip: 0 },
  })

  const realOrders = (orders as any[]).filter(
    (o) => !EXCLUDED_STATUSES.has(String(o.status)) && !EXCLUDED_EMAIL_SET.has(normEmail(o.email))
  )

  // Prepare 6 monthly buckets in chronological order.
  const buckets: { key: string; label: string; orders: number; revenue: number }[] = []
  const indexByKey = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    indexByKey.set(monthKey(d), buckets.length)
    buckets.push({
      key: monthKey(d),
      label: new Intl.DateTimeFormat("de-DE", { month: "short" }).format(d),
      orders: 0,
      revenue: 0,
    })
  }

  let monthOrders = 0
  let monthRevenue = 0
  let ytdOrders = 0
  let ytdRevenue = 0
  for (const o of realOrders) {
    const created = new Date(o.created_at)
    const total = Number(o.total || 0)
    if (created >= yearStart) {
      ytdOrders += 1
      ytdRevenue += total
    }
    const bi = indexByKey.get(monthKey(created))
    if (bi !== undefined) {
      buckets[bi].orders += 1
      buckets[bi].revenue += total
    }
    if (created >= monthStart) {
      monthOrders += 1
      monthRevenue += total
    }
  }
  for (const b of buckets) b.revenue = round2(b.revenue)

  // Customer counts (use metadata.count; take:1 keeps it cheap). The internal
  // accounts are netted out by counting them separately and subtracting — this
  // only relies on IN filters (`email: [...]`), which Medusa supports.
  const customerCount = async (extra?: Record<string, any>) => {
    const { metadata } = await query.graph({
      entity: "customer",
      fields: ["id"],
      filters: (extra ? extra : undefined) as any,
      pagination: { take: 1, skip: 0 },
    })
    return metadata?.count ?? 0
  }

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthFilter = { created_at: { $gte: monthStart.toISOString() } }
  const prevMonthFilter = {
    created_at: { $gte: prevMonthStart.toISOString(), $lt: monthStart.toISOString() },
  }

  const [
    totalAll,
    totalExcluded,
    newAll,
    newExcluded,
    prevNewAll,
    prevNewExcluded,
    activeProductsRes,
    activeWaRes,
  ] = await Promise.all([
    customerCount(),
    customerCount({ email: EXCLUDED_EMAILS }),
    customerCount(monthFilter),
    customerCount({ ...monthFilter, email: EXCLUDED_EMAILS }),
    customerCount(prevMonthFilter),
    customerCount({ ...prevMonthFilter, email: EXCLUDED_EMAILS }),
    // Active (published) products.
    query.graph({
      entity: "product",
      fields: ["id"],
      filters: { status: "published" } as any,
      pagination: { take: 1, skip: 0 },
    }),
    // The single active weekly action, if any.
    query.graph({
      entity: "weekly_action",
      fields: ["id", "title", "iso_week", "ends_at"],
      filters: { is_active: true } as any,
      pagination: { take: 1, skip: 0 },
    }),
  ])

  const activeWa = (activeWaRes.data as any[])[0] || null

  // E-mail marketing engagement — count of customers who opened / clicked at
  // least one campaign, and who are unsubscribed. Read from metadata.brevo (the
  // populated source; the customer_campaign/marketing_profile tables mirror this
  // as they fill in). Internal accounts are excluded like the other stats.
  const excludedEmails = Array.from(EXCLUDED_EMAIL_SET)
  const emailPlaceholders = excludedEmails.map(() => "?").join(", ")
  const marketingRes: any = await pg.raw(
    `select
       count(*) filter (where coalesce((metadata -> 'brevo' ->> 'campaigns_opened')::int, 0) > 0) as opened,
       count(*) filter (where coalesce((metadata -> 'brevo' ->> 'campaigns_clicked')::int, 0) > 0) as clicked,
       count(*) filter (where coalesce((metadata -> 'brevo' ->> 'unsubscribed')::boolean, false)
                          or coalesce((metadata -> 'brevo' ->> 'blacklisted')::boolean, false)) as unsubscribed
     from "customer"
     where deleted_at is null and lower(coalesce(email, '')) not in (${emailPlaceholders})`,
    excludedEmails
  )
  const mkt = marketingRes.rows?.[0] ?? { opened: "0", clicked: "0", unsubscribed: "0" }
  const marketing = {
    opened: Number(mkt.opened || 0),
    clicked: Number(mkt.clicked || 0),
    unsubscribed: Number(mkt.unsubscribed || 0),
  }

  const curOrders = monthOrders
  const curRevenue = round2(monthRevenue)
  const curNew = Math.max(0, newAll - newExcluded)

  // Previous month's orders/revenue come from the trend bucket (second-to-last).
  const prevBucket = buckets[buckets.length - 2] || { orders: 0, revenue: 0 }
  const prevNew = Math.max(0, prevNewAll - prevNewExcluded)

  // Month-over-month change. pct is null when there's no prior baseline (prev=0).
  const delta = (current: number, previous: number) => {
    if (previous === 0) {
      return { pct: null as number | null, dir: current > 0 ? "up" : "flat" }
    }
    const pct = Math.round(((current - previous) / previous) * 100)
    return { pct, dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" }
  }

  return res.json({
    currency_code: (realOrders[0]?.currency_code as string) || "eur",
    month: {
      orders: curOrders,
      revenue: curRevenue,
      new_customers: curNew,
    },
    deltas: {
      orders: delta(curOrders, prevBucket.orders),
      revenue: delta(curRevenue, prevBucket.revenue),
      new_customers: delta(curNew, prevNew),
    },
    totals: {
      customers: Math.max(0, totalAll - totalExcluded),
    },
    year: {
      orders: ytdOrders,
      revenue: round2(ytdRevenue),
    },
    active_products: activeProductsRes.metadata?.count ?? 0,
    weekly_action: activeWa
      ? { title: activeWa.title as string, iso_week: activeWa.iso_week as number }
      : null,
    marketing,
    series: buckets,
  })
}
