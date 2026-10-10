import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/customer-lists
 * Lists the native Medusa customer groups as selectable email audiences ("customer
 * lists"), each with LIVE recipient counts for the SES campaign page:
 *   - members      : customers in the group
 *   - eligible     : members with an email and NOT unsubscribed (what a send targets)
 *   - unsubscribed  : members currently suppressed
 *   - no_email      : members without an email (can't be mailed)
 *
 * A "customer list" IS a customer group — manage membership in the native admin
 * (Customers → Groups) or build one by rule via POST /admin/customer-lists/from-segment.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const groups = await pg("customer_group")
    .whereNull("deleted_at")
    .select("id", "name", "created_at")
    .orderBy("name", "asc")

  const ids = groups.map((g: any) => g.id)
  const stats: Record<string, { members: number; eligible: number; unsubscribed: number; no_email: number }> = {}

  if (ids.length) {
    const rows = await pg("customer_group_customer as cgc")
      .join("customer as c", "c.id", "cgc.customer_id")
      .leftJoin("marketing_profile as mp", "mp.customer_id", "c.id")
      .whereIn("cgc.customer_group_id", ids)
      .whereNull("cgc.deleted_at")
      .whereNull("c.deleted_at")
      .select("cgc.customer_group_id as group_id")
      .select(
        pg.raw(`COUNT(*) as members`),
        pg.raw(
          `COUNT(*) FILTER (WHERE c.email IS NOT NULL AND COALESCE(mp.unsubscribed, false) = false) as eligible`
        ),
        pg.raw(`COUNT(*) FILTER (WHERE COALESCE(mp.unsubscribed, false) = true) as unsubscribed`),
        pg.raw(`COUNT(*) FILTER (WHERE c.email IS NULL) as no_email`)
      )
      .groupBy("cgc.customer_group_id")

    for (const r of rows as any[]) {
      stats[r.group_id] = {
        members: Number(r.members),
        eligible: Number(r.eligible),
        unsubscribed: Number(r.unsubscribed),
        no_email: Number(r.no_email),
      }
    }
  }

  const lists = groups.map((g: any) => ({
    id: g.id,
    name: g.name,
    created_at: g.created_at,
    ...(stats[g.id] ?? { members: 0, eligible: 0, unsubscribed: 0, no_email: 0 }),
  }))

  res.json({ lists, count: lists.length })
}
