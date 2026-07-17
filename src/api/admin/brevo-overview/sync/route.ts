import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runBrevoSync } from "../../../../lib/brevo-sync"

const BREVO_API = "https://api.brevo.com/v3"

/**
 * POST /admin/brevo-overview/sync
 *
 * Manually triggers a Brevo engagement-stats sync (the same routine the nightly
 * job runs). The full sync is throttled (~150ms/contact) so it can take minutes
 * for a large customer base — it therefore runs fire-and-forget in the
 * background once started.
 *
 * Because a background run can't report back to the browser, we first do a
 * synchronous PREFLIGHT: verify the API key exists and that Brevo accepts it
 * (GET /account). This catches the errors that actually happen — missing key,
 * invalid/revoked key (401), IP not whitelisted (401/403), Brevo down — and
 * returns them in full so the "Sync" button can display the real reason.
 */
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return res.status(400).json({
      message: "BREVO_API_KEY ist nicht konfiguriert.",
      detail:
        "Auf diesem Server ist kein Brevo-API-Schlüssel gesetzt. Er muss in der Umgebungsvariable BREVO_API_KEY hinterlegt werden.",
    })
  }

  // Preflight: confirm Brevo accepts this key from this server before we commit
  // to a long background run. Any failure here is returned verbatim.
  try {
    const check = await fetch(`${BREVO_API}/account`, {
      headers: { "api-key": apiKey, accept: "application/json" },
    })
    if (!check.ok) {
      const body = (await check.text()).slice(0, 500)
      logger.error(`[brevo-sync] Preflight failed: Brevo ${check.status} — ${body}`)
      return res.status(502).json({
        message: `Brevo hat den Zugriff abgelehnt (HTTP ${check.status}).`,
        detail:
          check.status === 401 || check.status === 403
            ? `Der API-Schlüssel ist ungültig, widerrufen, oder die Server-IP ist nicht freigegeben. Antwort von Brevo: ${body}`
            : `Antwort von Brevo: ${body}`,
        brevoStatus: check.status,
      })
    }
  } catch (err) {
    const message = (err as Error).message
    logger.error(`[brevo-sync] Preflight network error: ${message}`)
    return res.status(502).json({
      message: "Brevo ist nicht erreichbar.",
      detail: `Verbindung zu ${BREVO_API} fehlgeschlagen: ${message}`,
    })
  }

  // Key verified. Run the full sync fire-and-forget; per-contact issues are
  // logged server-side (they can't stream back once we've returned 202).
  runBrevoSync(req.scope)
    .then((stats) => {
      logger.info(
        `[brevo-sync] Manual sync done: ${stats.synced} synced, ${stats.notInBrevo} not in Brevo, ${stats.failed} failed (of ${stats.processed}).`
      )
      if (stats.failed > 0) {
        logger.error(`[brevo-sync] ${stats.failed} contacts failed. Issues:\n${stats.issues.join("\n")}`)
      }
    })
    .catch((err) => logger.error(`[brevo-sync] Manual sync failed: ${(err as Error).message}`))

  res.status(202).json({ started: true })
}
