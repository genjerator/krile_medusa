import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Local helper to run the same logic as POST /admin/customer-lists/chunk from the
 * CLI (no admin session needed). Splits the mailable base into fixed-size customer
 * groups ("Send group 001"…) + a test group, rebuilding any existing auto_chunk
 * groups. See the route for the full contract.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/chunk-customer-groups.ts [size=200] [prefix="Send group"] [order=priority|email] [include_test=true]
 */
export default async function chunkCustomerGroups({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customer: any = container.resolve(Modules.CUSTOMER)

  const opts: Record<string, string> = {}
  for (const a of args) {
    const i = a.indexOf("=")
    if (i > 0) opts[a.slice(0, i).trim()] = a.slice(i + 1).trim()
  }
  const size = Math.max(1, Math.floor(Number(opts.size) || 200))
  const prefix = (opts.prefix ?? "Send group").trim() || "Send group"
  const order = opts.order === "email" ? "email" : "priority"
  const includeTest = (opts.include_test ?? "true").toLowerCase() !== "false"

  // 1) Drop existing auto-generated groups.
  const prior = await pg("customer_group")
    .whereNull("deleted_at")
    .whereRaw("metadata->>'auto_chunk' = 'true'")
    .select("id")
  if (prior.length) {
    const ids = prior.map((g: any) => g.id)
    await pg("customer_group_customer").whereIn("customer_group_id", ids).del()
    await customer.deleteCustomerGroups(ids)
    logger.info(`[chunk] removed ${ids.length} existing auto group(s)`)
  }

  // 2) Eligible real customers.
  const q = pg("customer as c")
    .leftJoin("marketing_profile as mp", "mp.customer_id", "c.id")
    .whereNull("c.deleted_at")
    .whereNotNull("c.email")
    .where((b: any) => b.whereNull("mp.unsubscribed").orWhere("mp.unsubscribed", false))
    .where((b: any) => b.whereNull("mp.user_type").orWhereNot("mp.user_type", "test"))
    .select("c.id as customer_id")
  if (order === "email") q.orderBy("c.email", "asc")
  else q.orderByRaw("COALESCE(mp.priority_rank, 7) asc").orderBy("c.email", "asc")
  const ids: string[] = (await q).map((r: any) => r.customer_id)

  // 3) One group per chunk.
  const chunkCount = Math.ceil(ids.length / size)
  for (let i = 0; i < chunkCount; i++) {
    const slice = ids.slice(i * size, (i + 1) * size)
    const name = `${prefix} ${String(i + 1).padStart(3, "0")}`
    const [group] = await customer.createCustomerGroups([
      { name, metadata: { auto_chunk: true, kind: "send", index: i + 1, size } },
    ])
    const pairs = slice.map((cid) => ({ customer_id: cid, customer_group_id: group.id }))
    for (let j = 0; j < pairs.length; j += 500) await customer.addCustomerToGroup(pairs.slice(j, j + 500))
    logger.info(`[chunk] ${name}: ${slice.length}`)
  }

  // 4) Test group.
  let testCount = 0
  if (includeTest) {
    const testRows: string[] = await pg("customer as c")
      .join("marketing_profile as mp", "mp.customer_id", "c.id")
      .whereNull("c.deleted_at")
      .whereNotNull("c.email")
      .where("mp.user_type", "test")
      .pluck("c.id")
    const name = `${prefix} · Test`
    const [group] = await customer.createCustomerGroups([{ name, metadata: { auto_chunk: true, kind: "test" } }])
    const pairs = testRows.map((cid) => ({ customer_id: cid, customer_group_id: group.id }))
    for (let j = 0; j < pairs.length; j += 500) if (pairs.length) await customer.addCustomerToGroup(pairs.slice(j, j + 500))
    testCount = pairs.length
    logger.info(`[chunk] ${name}: ${testCount}`)
  }

  logger.info(`[chunk] DONE — ${chunkCount} send group(s), ${ids.length} customers, test=${includeTest ? testCount : "—"}`)
}
