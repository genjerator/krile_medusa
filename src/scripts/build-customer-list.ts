import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resolveSegment } from "../lib/ses/segment-audience"

/**
 * Builds (or tops up) a native customer group from a SEGMENT RULE — the CLI twin of
 * POST /admin/customer-lists/from-segment. A "customer list" is just a customer
 * group; this snapshots the customers matching a rule into one. Idempotent: adds
 * only new matches, never removes, so rule-built membership and manual picks coexist.
 *
 * Rules: clicked | opened | buyer | rest | all | user_type:<x>   (see segment-audience.ts)
 *
 * Usage:
 *   npx medusa exec ./src/scripts/build-customer-list.ts \
 *     name="Segment: Klicker" rule=clicked [guest_orders=false]
 */
export default async function buildCustomerList({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customer: any = container.resolve(Modules.CUSTOMER)

  const opts: Record<string, string> = {}
  for (const a of args) {
    const i = a.indexOf("=")
    if (i > 0) opts[a.slice(0, i).trim()] = a.slice(i + 1).trim()
  }
  const name = (opts.name ?? "").trim()
  const rule = (opts.rule ?? "").trim()
  const includeGuestOrders = (opts.guest_orders ?? "false").toLowerCase() === "true"

  if (!name || !rule) {
    logger.error(
      'Usage: medusa exec ./src/scripts/build-customer-list.ts name="<group name>" ' +
        "rule=clicked|opened|buyer|rest|all|user_type:<x> [guest_orders=false]"
    )
    return
  }

  const recipients = await resolveSegment(pg, rule, { includeGuestOrders })
  logger.info(`[build-customer-list] rule="${rule}" matched ${recipients.length} eligible customer(s)`)

  const existing = await pg("customer_group").whereNull("deleted_at").where("name", name).first()
  let groupId: string
  if (existing) {
    groupId = existing.id
    logger.info(`[build-customer-list] using existing group "${name}" (${groupId})`)
  } else {
    const [group] = await customer.createCustomerGroups([{ name }])
    groupId = group.id
    logger.info(`[build-customer-list] created group "${name}" (${groupId})`)
  }

  const already = await pg("customer_group_customer")
    .where("customer_group_id", groupId)
    .whereNull("deleted_at")
    .pluck("customer_id")
  const alreadySet = new Set<string>(already)
  const toAdd = recipients.filter((r) => !alreadySet.has(r.customer_id))

  const CHUNK = 500
  for (let i = 0; i < toAdd.length; i += CHUNK) {
    const pairs = toAdd.slice(i, i + CHUNK).map((r) => ({ customer_id: r.customer_id, customer_group_id: groupId }))
    if (pairs.length) await customer.addCustomerToGroup(pairs)
  }

  logger.info(
    `[build-customer-list] done — "${name}" (${groupId}): added ${toAdd.length}, already ${alreadySet.size}, total ${alreadySet.size + toAdd.length}`
  )
}
