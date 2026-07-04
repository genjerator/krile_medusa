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

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  // First day of the month 5 months ago → a 6-bucket window incl. the current month.
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Orders in the last 6 months (40s of rows here; take a generous page).
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "status", "created_at", "email"],
    filters: { created_at: { $gte: windowStart.toISOString() } } as any,
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
  for (const o of realOrders) {
    const created = new Date(o.created_at)
    const total = Number(o.total || 0)
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

  const monthFilter = { created_at: { $gte: monthStart.toISOString() } }
  const [totalAll, totalExcluded, newAll, newExcluded] = await Promise.all([
    customerCount(),
    customerCount({ email: EXCLUDED_EMAILS }),
    customerCount(monthFilter),
    customerCount({ ...monthFilter, email: EXCLUDED_EMAILS }),
  ])

  return res.json({
    currency_code: (realOrders[0]?.currency_code as string) || "eur",
    month: {
      orders: monthOrders,
      revenue: round2(monthRevenue),
      new_customers: Math.max(0, newAll - newExcluded),
    },
    totals: {
      customers: Math.max(0, totalAll - totalExcluded),
    },
    series: buckets,
  })
}
