import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { setUnsubscribed } from "../lib/ses/marketing-profile"

/**
 * One-time backfill: suppress + soft-delete every customer that already has a
 * terminal SES suppression signal but was never removed from the active base
 * (the nightly recompute previously un-suppressed SES-only events because they
 * carry no Brevo metadata).
 *
 * Scope — SES only, hard bounces only:
 *   - complained_at        (SES complaint)
 *   - bounced_at, source=ses  (SES PERMANENT/hard bounce — the SES webhook only
 *     stamps bounced_at for Permanent bounces, so soft bounces are excluded)
 *   - unsubscribed_at, source=ses  (clicked the one-click unsubscribe link)
 *
 * Brevo rows are deliberately left untouched (Brevo stamps bounced_at for soft
 * bounces too, and Brevo unsubscribes are already handled by the nightly job).
 *
 * Idempotent: setUnsubscribed / softDeleteCustomers are no-ops on an already
 * soft-deleted customer, so this is safe to re-run.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/backfill-ses-suppressions.ts          # apply
 *   npx medusa exec ./src/scripts/backfill-ses-suppressions.ts dry-run  # count only
 */
export default async function backfillSesSuppressions({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const dryRun = (args ?? []).includes("dry-run")

  // Distinct LIVE customers carrying a terminal SES suppression signal.
  const rows = (await pg("customer_campaign as cc")
    .join("customer as c", "c.id", "cc.customer_id")
    .whereNull("c.deleted_at")
    .whereNull("cc.deleted_at")
    .where((qb: any) => {
      qb.whereNotNull("cc.complained_at")
        .orWhere((q: any) => q.whereNotNull("cc.bounced_at").where("cc.source", "ses"))
        .orWhere((q: any) => q.whereNotNull("cc.unsubscribed_at").where("cc.source", "ses"))
    })
    .distinct("cc.customer_id as id", "c.email as email")) as { id: string; email: string }[]

  logger.info(`[backfill-ses] ${rows.length} live customer(s) with a terminal SES suppression signal.`)

  if (dryRun) {
    for (const r of rows) logger.info(`  would suppress: ${r.email} (${r.id})`)
    logger.info("[backfill-ses] dry-run — nothing changed.")
    return
  }

  let ok = 0
  let failed = 0
  for (const r of rows) {
    try {
      await setUnsubscribed(container, r.id)
      ok++
    } catch (err) {
      failed++
      logger.error(`[backfill-ses] failed for ${r.email} (${r.id}): ${(err as Error).message}`)
    }
  }

  logger.info(`[backfill-ses] done — suppressed + soft-deleted ${ok} customer(s), ${failed} failed.`)
}
