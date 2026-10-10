import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_BATCH_MODULE } from "../../modules/sesBatch"
import { MARKETING_MODULE } from "../../modules/marketing"
import { sendOutboxEmail } from "./send-outbox"
import { parseGroupSendAudience } from "./campaign-groups"

/**
 * The throttled QUEUE DRAIN for campaign group-sends. Enqueuing a group flips its
 * outbox rows to `queued`; this drain (run by the `send-ses-queue` scheduled job
 * every minute) claims a bounded chunk and sends them through the SINGLE send
 * function (`sendOutboxEmail`) — same suppression re-check, render-at-send, SES
 * send and tracking as the manual button.
 *
 * Safety:
 *   - Claim with `FOR UPDATE SKIP LOCKED` inside a txn, flipping to `sending`, so
 *     overlapping job runs never grab the same rows (R5 double-send).
 *   - `sendOutboxEmail` is idempotent (never re-sends a `sent` row).
 *   - Resumable: a crash leaves rows `queued`/`sending`; the next tick continues.
 *
 * Pacing: `chunk` rows per call → chunk-per-minute throughput (sends are sequential,
 * one SMTP call at a time). Size `chunk` under the SES account's max send rate.
 */
export type DrainResult = {
  claimed: number
  sent: number
  skipped: number
  failed: number
}

export async function drainSesQueue(
  container: MedusaContainer,
  opts?: { chunk?: number; delayMs?: number }
): Promise<DrainResult> {
  const pg: any = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const sesBatch: any = container.resolve(SES_BATCH_MODULE)
  const marketing: any = container.resolve(MARKETING_MODULE)

  const chunk = Math.max(1, opts?.chunk ?? 75)
  const delayMs = Math.max(0, opts?.delayMs ?? 0)

  // Claim a chunk of queued rows atomically (skip rows another run already holds).
  const claimed: Array<{ id: string; batch_id: string | null }> = await pg.transaction(async (trx: any) => {
    const rows = await trx("ses_emails")
      .where("status", "queued")
      .orderBy("to_email", "asc")
      .limit(chunk)
      .forUpdate()
      .skipLocked()
      .select("id", "batch_id")
    const ids = rows.map((r: any) => r.id)
    if (ids.length) {
      await trx("ses_emails").whereIn("id", ids).update({ status: "sending" })
    }
    return rows as Array<{ id: string; batch_id: string | null }>
  })

  if (!claimed.length) return { claimed: 0, sent: 0, skipped: 0, failed: 0 }

  let sent = 0
  let skipped = 0
  let failed = 0
  const touchedBatches = new Set<string>()
  for (const r of claimed) {
    if (r.batch_id) touchedBatches.add(r.batch_id)
    const result = await sendOutboxEmail(container, r.id).catch((e) => ({
      status: "failed" as const,
      error: (e as Error).message,
    }))
    if (result.status === "sent") sent++
    else if (result.status === "skipped") skipped++
    else if (result.status === "failed") failed++
    if (delayMs) await new Promise((res) => setTimeout(res, delayMs))
  }

  // Refresh the touched batches' counters/status, then advance any now-finished
  // campaigns to "sent".
  const touchedCampaigns = new Set<string>()
  for (const batchId of touchedBatches) {
    const campaignId = await refreshBatch(pg, sesBatch, batchId)
    if (campaignId) touchedCampaigns.add(campaignId)
  }
  for (const campaignId of touchedCampaigns) {
    await maybeCompleteCampaign(pg, marketing, campaignId)
  }

  return { claimed: claimed.length, sent, skipped, failed }
}

/** Recompute a batch's counters + status from its live row states. Returns the
 * owning campaign id (if any) so the caller can check campaign completion. */
async function refreshBatch(pg: any, sesBatch: any, batchId: string): Promise<string | null> {
  const agg = await pg("ses_emails").where("batch_id", batchId).groupBy("status").select("status").count("* as c")
  const byStatus: Record<string, number> = {}
  for (const a of agg as any[]) byStatus[a.status] = Number(a.c)
  const total = Object.values(byStatus).reduce((s, n) => s + n, 0)
  const remaining = (byStatus.pending ?? 0) + (byStatus.queued ?? 0) + (byStatus.sending ?? 0)
  const status = remaining > 0 ? "sending" : (byStatus.failed ?? 0) > 0 ? "failed" : "sent"
  await sesBatch.updateSesBatches({
    id: batchId,
    status,
    total,
    sent: byStatus.sent ?? 0,
    failed: byStatus.failed ?? 0,
    skipped: byStatus.skipped ?? 0,
  })
  const batch = await pg("ses_batch").where({ id: batchId }).first()
  return batch?.campaign_id ?? null
}

/** Mark a campaign `sent` once none of its batches have rows left to send. */
async function maybeCompleteCampaign(pg: any, marketing: any, campaignId: string): Promise<void> {
  const batchIds = (
    await pg("ses_batch").where({ campaign_id: campaignId }).whereNull("deleted_at").select("id")
  ).map((b: any) => b.id)
  if (!batchIds.length) return
  const remaining = await pg("ses_emails")
    .whereIn("batch_id", batchIds)
    .whereIn("status", ["pending", "queued", "sending"])
    .count("* as c")
    .first()
  if (Number(remaining?.c ?? 0) === 0) {
    const campaign = await marketing.retrieveEmailCampaign(campaignId).catch(() => null)
    if (campaign && campaign.status !== "sent") {
      await marketing.updateEmailCampaigns([{ id: campaignId, status: "sent", sent_at: new Date() }])
    }
  }
}

// Re-exported for the enqueue endpoint's convenience.
export { parseGroupSendAudience }
