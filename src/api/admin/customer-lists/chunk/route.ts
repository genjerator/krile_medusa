import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Body = { size?: number; prefix?: string; order?: "priority" | "email"; include_test?: boolean }

/**
 * POST /admin/customer-lists/chunk  { size?, prefix?, order?, include_test? }
 * Auto-generates native customer groups by splitting the mailable customer base
 * into fixed-size chunks (default 200) — a warm-up "ramp" where each group is one
 * campaign group-send. Plus an optional TEST group (user_type="test").
 *
 *   - Eligible = has an email, not deleted, not unsubscribed, not a test customer.
 *     Ordered by marketing priority (best customers in the first groups) or email.
 *   - Groups are named "<prefix> 001", "<prefix> 002", … and the test group
 *     "<prefix> · Test". All are stamped metadata.auto_chunk=true.
 *   - REBUILD semantics: every existing auto_chunk group is DELETED first, then the
 *     groups are recreated from the current base (new ids). Run this BEFORE assigning
 *     groups to a campaign — regenerating after assignment orphans the campaign's
 *     group-sends (they point at the deleted groups).
 *
 * Returns { groups: [{id,name,count}], test, total_customers, group_count }.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customer: any = req.scope.resolve(Modules.CUSTOMER)

  const size = Math.max(1, Math.floor(Number(req.body?.size) || 200))
  const prefix = (req.body?.prefix ?? "Send group").trim() || "Send group"
  const order = req.body?.order === "email" ? "email" : "priority"
  const includeTest = req.body?.include_test !== false

  // 1) Drop existing auto-generated groups (rebuild from scratch).
  const prior = await pg("customer_group")
    .whereNull("deleted_at")
    .whereRaw("metadata->>'auto_chunk' = 'true'")
    .select("id")
  if (prior.length) {
    const ids = prior.map((g: any) => g.id)
    // Remove memberships first, then the groups themselves.
    await pg("customer_group_customer").whereIn("customer_group_id", ids).del()
    await customer.deleteCustomerGroups(ids)
  }

  // 2) Eligible real customers (exclude test + unsubscribed + no email), ordered.
  const q = pg("customer as c")
    .leftJoin("marketing_profile as mp", "mp.customer_id", "c.id")
    .whereNull("c.deleted_at")
    .whereNotNull("c.email")
    .where((b: any) => b.whereNull("mp.unsubscribed").orWhere("mp.unsubscribed", false))
    .where((b: any) => b.whereNull("mp.user_type").orWhereNot("mp.user_type", "test"))
    .select("c.id as customer_id")
  if (order === "email") {
    q.orderBy("c.email", "asc")
  } else {
    q.orderByRaw("COALESCE(mp.priority_rank, 7) asc").orderBy("c.email", "asc")
  }
  const customers: Array<{ customer_id: string }> = await q
  const ids = customers.map((r) => r.customer_id)

  // 3) Create one group per chunk of `size`.
  const groups: Array<{ id: string; name: string; count: number }> = []
  const chunkCount = Math.ceil(ids.length / size)
  for (let i = 0; i < chunkCount; i++) {
    const slice = ids.slice(i * size, (i + 1) * size)
    const name = `${prefix} ${String(i + 1).padStart(3, "0")}`
    const [group] = await customer.createCustomerGroups([
      { name, metadata: { auto_chunk: true, kind: "send", index: i + 1, size } },
    ])
    const pairs = slice.map((cid) => ({ customer_id: cid, customer_group_id: group.id }))
    const CHUNK = 500
    for (let j = 0; j < pairs.length; j += CHUNK) {
      await customer.addCustomerToGroup(pairs.slice(j, j + CHUNK))
    }
    groups.push({ id: group.id, name, count: slice.length })
  }

  // 4) Test group.
  let test: { id: string; name: string; count: number } | null = null
  if (includeTest) {
    const testRows = await pg("customer as c")
      .join("marketing_profile as mp", "mp.customer_id", "c.id")
      .whereNull("c.deleted_at")
      .whereNotNull("c.email")
      .where("mp.user_type", "test")
      .pluck("c.id")
    const name = `${prefix} · Test`
    const [group] = await customer.createCustomerGroups([
      { name, metadata: { auto_chunk: true, kind: "test" } },
    ])
    const pairs = (testRows as string[]).map((cid) => ({ customer_id: cid, customer_group_id: group.id }))
    const CHUNK = 500
    for (let j = 0; j < pairs.length; j += CHUNK) {
      if (pairs.length) await customer.addCustomerToGroup(pairs.slice(j, j + CHUNK))
    }
    test = { id: group.id, name, count: pairs.length }
  }

  logger.info(
    `[customer-lists/chunk] size=${size} prefix="${prefix}" order=${order} → ${groups.length} group(s), ${ids.length} customers, test=${test?.count ?? "—"}`
  )
  res.json({ groups, test, total_customers: ids.length, group_count: groups.length })
}
