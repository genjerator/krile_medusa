import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/ses-batches?audience=ramp
 * Lists the send-run batches of a segment (default "ramp") for the prototype page,
 * each with LIVE per-status counts of its ses_emails rows (computed here so the
 * page is always accurate even before the sender maintains the ses_batch counters).
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const audience = typeof req.query.audience === "string" && req.query.audience ? req.query.audience : "ramp"

  const batches = await pg("ses_batch")
    .whereNull("deleted_at")
    .where("audience", "like", `${audience}#%`)
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
