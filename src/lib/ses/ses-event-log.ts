import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EVENT_LOG_MODULE } from "../../modules/sesEventLog"

/**
 * Durable audit log of every SES event we receive (via SNS). Written FIRST in the
 * webhook, before matching, so nothing is lost on a handler error (SES has no
 * re-poll). Backed by the `sesEventLog` module + its hand-written migration.
 */

export type SesEventLogEntry = {
  event: string | null
  email: string | null
  message_id: string | null
  campaign_id: string | null
  matched: boolean
  payload: unknown
}

/** Insert one event row; returns its id (so the caller can flip `matched` later). */
export async function logSesEvent(
  container: MedusaContainer,
  entry: SesEventLogEntry
): Promise<string | null> {
  const service: any = container.resolve(SES_EVENT_LOG_MODULE)
  const created = await service.createSesEventLogs({
    event: entry.event,
    email: entry.email,
    message_id: entry.message_id,
    campaign_id: entry.campaign_id,
    matched: entry.matched,
    payload: entry.payload ?? {},
  })
  return created?.id ?? null
}

/** Mark a previously-logged event as matched (best-effort). */
export async function markSesEventMatched(
  container: MedusaContainer,
  id: string
): Promise<void> {
  const service: any = container.resolve(SES_EVENT_LOG_MODULE)
  await service.updateSesEventLogs({ id, matched: true })
}

/**
 * Hard-delete log rows older than `days` (raw DELETE so storage is reclaimed).
 * Returns rows removed.
 */
export async function pruneSesEventLog(
  container: MedusaContainer,
  days = 30
): Promise<number> {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const d = Math.max(1, Math.floor(days))
  const deleted = await pg("ses_event_log")
    .where("created_at", "<", pg.raw(`now() - interval '${d} days'`))
    .del()
  return typeof deleted === "number" ? deleted : 0
}
