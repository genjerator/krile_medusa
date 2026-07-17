import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runBrevoSync } from "../../../../lib/brevo-sync"

/**
 * POST /admin/brevo-overview/sync
 *
 * Manually triggers a Brevo engagement-stats sync (the same routine the nightly
 * job runs). The sync is throttled (~150ms/contact) so it can take minutes for a
 * large customer base — it therefore runs fire-and-forget in the background and
 * this handler returns 202 immediately. Feeds the "Sync" button on the
 * "Brevo Übersicht" panel above the admin customer list.
 */
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.BREVO_API_KEY) {
    return res.status(400).json({
      message: "BREVO_API_KEY ist nicht konfiguriert — Sync nicht möglich.",
    })
  }

  // Fire-and-forget: don't await, so the request returns before the (slow,
  // throttled) sync finishes. Errors are logged, never surfaced to the client.
  runBrevoSync(req.scope)
    .then((stats) =>
      logger.info(
        `[brevo-sync] Manual sync done: ${stats.synced} synced, ${stats.notInBrevo} not in Brevo, ${stats.failed} failed (of ${stats.processed}).`
      )
    )
    .catch((err) => logger.error(`[brevo-sync] Manual sync failed: ${(err as Error).message}`))

  res.status(202).json({ started: true })
}
