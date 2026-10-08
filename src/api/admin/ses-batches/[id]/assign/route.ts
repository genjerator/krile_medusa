import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type Body = { source_id?: string; source_type?: string }

/**
 * POST /admin/ses-batches/:id/assign  { source_id, source_type? }
 * Stamps a campaign (template ref) onto a campaign-agnostic batch AND all its
 * ses_emails outbox rows, so they become sendable. Mirrors the
 * assign-campaign-to-batches.ts script for a single batch. Re-runnable (re-point a
 * segment at a different campaign by assigning again).
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const id = req.params.id
  const sourceId = (req.body?.source_id ?? "").trim()
  const sourceType = (req.body?.source_type ?? "weekly_action").trim()
  if (!sourceId) {
    return res.status(400).json({ message: "source_id is required" })
  }

  const batch = await pg("ses_batch").where({ id }).whereNull("deleted_at").first()
  if (!batch) {
    return res.status(404).json({ message: "Batch not found" })
  }

  await pg("ses_batch").where({ id }).update({ source_type: sourceType, source_id: sourceId })
  const updatedRows = await pg("ses_emails")
    .where("batch_id", id)
    .update({ source_type: sourceType, source_id: sourceId })

  res.json({ ok: true, batch_id: id, source_type: sourceType, source_id: sourceId, updated_rows: updatedRows })
}
