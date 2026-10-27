import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Order attribution for marketing-email recipients: of the customers who
 * RECEIVED an email, how many placed an order AFTER receiving it, and the
 * revenue those orders represent.
 *
 * A recipient = one email with its earliest delivery time (`first_delivered`).
 * An order counts when its email matches a recipient (case-insensitive) and it
 * was created on/after that recipient's first delivery. Draft/canceled orders
 * are excluded, matching the dashboard's revenue definition. `order.total` is
 * only exposed through `query.graph` (the raw `order` table has no total
 * column), so orders are read via the query service, not SQL.
 *
 * This is correlation — "ordered after being emailed" — not proof the email
 * caused the sale; it's the standard email→order conversion figure.
 */

export type ConversionRecipient = { email: string; first_delivered: string | Date }

export type CampaignConversion = {
  recipients: number // distinct recipient emails
  ordered: number // distinct recipients who ordered after receiving
  orders: number // total qualifying orders
  revenue: number // sum of order.total for qualifying orders
  currency_code: string
  rate: number // ordered / recipients, percent (one decimal)
}

const EXCLUDED_STATUSES = new Set(["canceled", "draft"])

export async function computeCampaignConversion(
  container: MedusaContainer,
  recipients: ConversionRecipient[]
): Promise<CampaignConversion> {
  const empty: CampaignConversion = {
    recipients: 0,
    ordered: 0,
    orders: 0,
    revenue: 0,
    currency_code: "eur",
    rate: 0,
  }
  if (!recipients.length) return empty

  // email (lowercased) → earliest delivery time (ms).
  const firstByEmail = new Map<string, number>()
  let minDelivered = Infinity
  for (const r of recipients) {
    if (!r.email) continue
    const email = r.email.toLowerCase()
    const t = new Date(r.first_delivered).getTime()
    if (!Number.isFinite(t)) continue
    const prev = firstByEmail.get(email)
    if (prev === undefined || t < prev) firstByEmail.set(email, t)
    if (t < minDelivered) minDelivered = t
  }
  if (firstByEmail.size === 0) return empty

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  // Fetch every order since the first delivery, then match in JS — far cheaper
  // than a thousands-wide email IN filter, and the order volume here is small.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "status", "created_at", "email"],
    filters: { created_at: { $gte: new Date(minDelivered).toISOString() } } as any,
    pagination: { take: 10000, skip: 0 },
  })

  const buyers = new Set<string>()
  let orderCount = 0
  let revenue = 0
  let currency = "eur"
  for (const o of orders as any[]) {
    if (EXCLUDED_STATUSES.has(String(o.status))) continue
    const email = String(o.email ?? "").toLowerCase()
    const fd = firstByEmail.get(email)
    if (fd === undefined) continue
    if (new Date(o.created_at).getTime() < fd) continue
    buyers.add(email)
    orderCount += 1
    revenue += Number(o.total || 0)
    if (o.currency_code) currency = String(o.currency_code)
  }

  const recipientsCount = firstByEmail.size
  return {
    recipients: recipientsCount,
    ordered: buyers.size,
    orders: orderCount,
    revenue: Math.round(revenue * 100) / 100,
    currency_code: currency,
    rate: recipientsCount > 0 ? Math.round((buyers.size / recipientsCount) * 1000) / 10 : 0,
  }
}
