import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/ses-batches?audience=ramp
 * Lists the send-run batches of a segment (default "ramp") for the prototype page,
 * each with LIVE per-status counts of its ses_emails rows (computed here so the
 * page is always accurate even before the sender maintains the ses_batch counters).
 *
 * Audience modes:
 *   - "ramp" / "test"        → the ramp family (ramp#01…) / the single test batch
 *   - "groups"               → every customer-list batch (audience "group:*")
 *   - "group:<id>"           → the one batch for that customer list
 * For group batches the customer-list NAME is resolved and returned as `group_name`.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const audience = typeof req.query.audience === "string" && req.query.audience ? req.query.audience : "ramp"
  const isGroupMode = audience === "groups" || audience.startsWith("group:")

  const q = pg("ses_batch")
    .whereNull("deleted_at")
    .select(
      "id",
      "audience",
      "source_type",
      "source_id",
      "status",
      "scheduled_at",
      "total",
      "created_at"
    )
    .orderBy("audience", "asc")

  if (audience === "groups") {
    q.where("audience", "like", "group:%")
  } else if (audience.startsWith("group:")) {
    q.where("audience", audience)
  } else {
    // Match a segment: "ramp" → ramp#01…, "test" → the single "test" batch.
    q.where((b: any) => b.where("audience", audience).orWhere("audience", "like", `${audience}#%`))
  }
  const batches = await q

  // Resolve customer-list names for group batches (audience "group:<id>").
  if (isGroupMode && batches.length) {
    const groupIds = batches
      .map((b: any) => (b.audience.startsWith("group:") ? b.audience.slice("group:".length) : null))
      .filter(Boolean)
    if (groupIds.length) {
      const groups = await pg("customer_group").whereIn("id", groupIds).select("id", "name")
      const nameById: Record<string, string> = {}
      for (const g of groups as any[]) nameById[g.id] = g.name
      for (const b of batches as any[]) {
        const gid = b.audience.startsWith("group:") ? b.audience.slice("group:".length) : null
        b.group_name = gid ? nameById[gid] ?? null : null
      }
    }
  }

  const ids = batches.map((b: any) => b.id)
  const counts: Record<string, Record<string, number>> = {}
  if (ids.length) {
    const rows = await pg("ses_emails")
      .whereIn("batch_id", ids)
      .groupBy("batch_id", "status")
      .select("batch_id", "status")
      .count("* as c")
    for (const r of rows as any[]) {
      ;(counts[r.batch_id] ??= {})[r.status] = Number(r.c)
    }
  }

  const result = batches.map((b: any) => ({ ...b, counts: counts[b.id] ?? {} }))
  res.json({ batches: result, count: result.length })
}
