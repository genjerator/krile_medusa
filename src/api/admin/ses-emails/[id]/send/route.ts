import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendOutboxEmail } from "../../../../../lib/ses/send-outbox"

/**
 * POST /admin/ses-emails/:id/send — sends one outbox row via the shared send
 * function (re-checks unsubscribe, renders the template, sends via SES, records
 * tracking). Used by the manual "Senden" button.
 */
export async function POST(req: AuthenticatedMedusaRequest<{ override_to?: string }>, res: MedusaResponse) {
  const id = req.params.id
  const overrideTo = (req.body?.override_to ?? "").trim() || undefined
  try {
    const result = await sendOutboxEmail(req.scope, id, { overrideTo })
    if (result.status === "failed") {
      return res.status(502).json({ ok: false, status: "failed", message: result.error })
    }
    return res.json({ ok: true, ...result })
  } catch (err) {
    return res.status(400).json({ ok: false, message: (err as Error).message })
  }
}
