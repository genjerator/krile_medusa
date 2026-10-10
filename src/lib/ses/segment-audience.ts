/**
 * Resolve the set of customers matching a SEGMENT RULE — the audience behind a
 * customer list built "by rule". Returns one row per eligible customer
 * (`{ customer_id, to_email }`), de-duplicated, with no email missing and no
 * unsubscribed customer (suppression is honoured at selection time; the send-time
 * re-check in `sendOutboxEmail` is still the authoritative guarantee).
 *
 * Shares the engagement/buyer ranking SQL used by `seed-campaign-batches.ts` so
 * "clicked / opened / buyer / rest" mean exactly the same thing here.
 *
 * Rules:
 *   clicked          — clicked a Brevo campaign
 *   opened           — opened a Brevo campaign
 *   buyer            — placed an order
 *   rest             — none of the above (no click, no open, no order)
 *   all              — every eligible customer
 *   user_type:<x>    — marketing_profile.user_type = <x>  (e.g. user_type:test)
 */
export type SegmentRule = string // "clicked" | "opened" | "buyer" | "rest" | "all" | "user_type:<x>"

export type SegmentRecipient = { customer_id: string; to_email: string }

export const SEGMENT_RULES = ["clicked", "opened", "buyer", "rest", "all"] as const

export async function resolveSegment(
  pg: any,
  rule: SegmentRule,
  opts?: { includeGuestOrders?: boolean }
): Promise<SegmentRecipient[]> {
  const r = (rule ?? "").trim()

  // user_type:<x> — simple lookup on marketing_profile, no engagement needed.
  if (r.startsWith("user_type:")) {
    const ut = r.slice("user_type:".length).trim()
    if (!ut) return []
    const rows = await pg("marketing_profile as mp")
      .join("customer as c", "c.id", "mp.customer_id")
      .whereNull("mp.deleted_at")
      .whereNull("c.deleted_at")
      .whereNotNull("c.email")
      .where("mp.user_type", ut)
      .where((b: any) => b.whereNull("mp.unsubscribed").orWhere("mp.unsubscribed", false))
      .select("c.id as customer_id", "c.email as to_email")
      .orderBy("c.email")
    return rows as SegmentRecipient[]
  }

  if (!(["clicked", "opened", "buyer", "rest", "all"] as string[]).includes(r)) {
    throw new Error(
      `Unknown segment rule "${rule}". Use: clicked | opened | buyer | rest | all | user_type:<x>`
    )
  }

  const includeGuestOrders = opts?.includeGuestOrders ?? false
  const buyerJoin = includeGuestOrders
    ? `LEFT JOIN (
         SELECT DISTINCT customer_id FROM "order" WHERE customer_id IS NOT NULL
         UNION
         SELECT c2.id AS customer_id FROM "order" o2
           JOIN customer c2 ON lower(c2.email) = lower(o2.email)
          WHERE o2.email IS NOT NULL
       ) b ON b.customer_id = c.id`
    : `LEFT JOIN (
         SELECT DISTINCT customer_id FROM "order" WHERE customer_id IS NOT NULL
       ) b ON b.customer_id = c.id`

  // Per-customer flags; filter to the requested rule in the outer WHERE.
  const ruleFilter =
    r === "clicked"
      ? "COALESCE(e.clicked, false)"
      : r === "opened"
      ? "COALESCE(e.opened, false)"
      : r === "buyer"
      ? "b.customer_id IS NOT NULL"
      : r === "rest"
      ? "NOT COALESCE(e.clicked, false) AND NOT COALESCE(e.opened, false) AND b.customer_id IS NULL"
      : "true" // all

  const rows: SegmentRecipient[] = await pg
    .raw(
      `
      WITH engagement AS (
        SELECT customer_id,
               bool_or(clicked_at IS NOT NULL) AS clicked,
               bool_or(opened_at  IS NOT NULL) AS opened
        FROM customer_campaign
        WHERE source = 'brevo'
        GROUP BY customer_id
      )
      SELECT c.id AS customer_id, c.email AS to_email
      FROM customer c
      LEFT JOIN engagement e         ON e.customer_id  = c.id
      ${buyerJoin}
      LEFT JOIN marketing_profile mp ON mp.customer_id = c.id
      WHERE c.deleted_at IS NULL
        AND c.email IS NOT NULL
        AND COALESCE(mp.unsubscribed, false) = false
        AND (${ruleFilter})
      ORDER BY c.email ASC
      `
    )
    .then((res: any) => res.rows ?? res)

  return rows
}
