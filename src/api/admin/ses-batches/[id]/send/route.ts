import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_BATCH_MODULE } from "../../../../../modules/sesBatch"
import { sendOutboxEmail } from "../../../../../lib/ses/send-outbox"

type Body = { override_to?: string; limit?: number }

/**
 * POST /admin/ses-batches/:id/send  { override_to?, limit? }
 * Sends a whole batch through the SINGLE send function (sendOutboxEmail) — same
 * per-recipient suppression re-check, render-at-send, SES send and customer_campaign
 * tracking as the per-row button. Processes every sendable row (status
 * pending|queued|failed), sequentially (one SES call at a time). Already-sent rows
 * are skipped, so re-running is safe (only retries what's left).
 *
 * - override_to: redirect every message to one inbox (testing). Suppression still
 *   applies, so this can't bypass an unsubscribe.
 * - limit: cap how many rows to process this call (e.g. send a handful first).
 *
 * Refuses if the batch has no campaign assigned (assign one first via …/assign).
 * Afterwards it refreshes the ses_batch status + counters from the live row states.
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const sesBatch: any = req.scope.resolve(SES_BATCH_MODULE)
  const id = req.params.id

  const overrideTo = (req.body?.override_to ?? "").trim() || undefined
  const rawLimit = Number(req.body?.limit)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : undefined

  const batch = await pg("ses_batch").where({ id }).whereNull("deleted_at").first()
  if (!batch) {
    return res.status(404).json({ message: "Batch not found" })
  }
  if (!batch.source_type || !batch.source_id) {
    return res
      .status(400)
      .json({ message: "Diesem Batch ist keine Kampagne zugewiesen — zuerst eine Wochenaktion zuweisen." })
  }

  // Mark the batch in-progress.
  await sesBatch.updateSesBatches({ id, status: "sending" })

  // Sendable rows: everything not already sent / mid-send, best (lowest email) first
  // to keep the ordering stable with the seeded ramp.
  const q = pg("ses_emails")
    .where("batch_id", id)
    .whereIn("status", ["pending", "queued", "failed"])
    .select("id")
    .orderBy("to_email", "asc")
  if (limit) q.limit(limit)
  const rows = await q

  let sent = 0
  let skipped = 0
  let failed = 0
  for (const r of rows as any[]) {
    const result = await sendOutboxEmail(req.scope, r.id, { overrideTo }).catch((e) => ({
      status: "failed" as const,
      error: (e as Error).message,
    }))
    if (result.status === "sent") sent++
    else if (result.status === "skipped") skipped++
    else if (result.status === "failed") failed++
  }

  // Refresh counters + status from the live row states (authoritative).
  const agg = await pg("ses_emails").where("batch_id", id).groupBy("status").select("status").count("* as c")
  const byStatus: Record<string, number> = {}
  for (const a of agg as any[]) byStatus[a.status] = Number(a.c)
  const total = Object.values(byStatus).reduce((s, n) => s + n, 0)
  const remaining = (byStatus.pending ?? 0) + (byStatus.queued ?? 0) + (byStatus.sending ?? 0)
  const status = remaining > 0 ? "sending" : (byStatus.failed ?? 0) > 0 ? "failed" : "sent"

  await sesBatch.updateSesBatches({
    id,
    status,
    total,
    sent: byStatus.sent ?? 0,
    failed: byStatus.failed ?? 0,
    skipped: byStatus.skipped ?? 0,
  })

  logger.info(
    `[ses-batches/send] ${batch.audience} (${id}): processed=${rows.length} sent=${sent} skipped=${skipped} failed=${failed} → status=${status}`
  )
  res.json({ ok: true, batch_id: id, status, processed: rows.length, sent, skipped, failed })
}
