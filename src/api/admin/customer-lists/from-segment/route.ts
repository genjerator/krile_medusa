import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resolveSegment, SegmentRule } from "../../../../lib/ses/segment-audience"

type Body = { name?: string; rule?: SegmentRule; include_guest_orders?: boolean }

/**
 * POST /admin/customer-lists/from-segment  { name, rule, include_guest_orders? }
 * Builds (or tops up) a native customer group from a SEGMENT RULE — a "customer
 * list by rule". Find-or-creates the group by `name`, resolves the matching
 * customers via resolveSegment() (clicked|opened|buyer|rest|all|user_type:<x>), and
 * adds the ones not already in the group. Idempotent: re-running only adds the new
 * matches (it never removes members, so a rule-built list and manual picks coexist).
 *
 * Returns { group_id, name, matched, added, already, total }.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const customer: any = req.scope.resolve(Modules.CUSTOMER)

  const name = (req.body?.name ?? "").trim()
  const rule = (req.body?.rule ?? "").trim()
  const includeGuestOrders = req.body?.include_guest_orders === true
  if (!name) return res.status(400).json({ message: "name is required" })
  if (!rule) return res.status(400).json({ message: "rule is required" })

  let recipients
  try {
    recipients = await resolveSegment(pg, rule, { includeGuestOrders })
  } catch (e) {
    return res.status(400).json({ message: (e as Error).message })
  }

  // Find-or-create the group by name (name is unique among non-deleted groups).
  const existing = await pg("customer_group").whereNull("deleted_at").where("name", name).first()
  let groupId: string
  if (existing) {
    groupId = existing.id
  } else {
    const [group] = await customer.createCustomerGroups([{ name }])
    groupId = group.id
  }

  // Add only customers not already in the group.
  const already = await pg("customer_group_customer")
    .where("customer_group_id", groupId)
    .whereNull("deleted_at")
    .pluck("customer_id")
  const alreadySet = new Set<string>(already)
  const toAdd = recipients.filter((r) => !alreadySet.has(r.customer_id))

  // addCustomerToGroup accepts a batch of { customer_id, customer_group_id } pairs.
  const CHUNK = 500
  for (let i = 0; i < toAdd.length; i += CHUNK) {
    const pairs = toAdd.slice(i, i + CHUNK).map((r) => ({ customer_id: r.customer_id, customer_group_id: groupId }))
    if (pairs.length) await customer.addCustomerToGroup(pairs)
  }

  logger.info(
    `[customer-lists/from-segment] "${name}" (${groupId}) rule=${rule}: matched=${recipients.length} added=${toAdd.length} already=${alreadySet.size}`
  )
  res.json({
    group_id: groupId,
    name,
    matched: recipients.length,
    added: toAdd.length,
    already: alreadySet.size,
    total: alreadySet.size + toAdd.length,
  })
}
