import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BREVO_WEBHOOK_LOG_MODULE } from "../../../modules/brevoWebhookLog"

/**
 * GET /admin/brevo-webhook-logs?q=&event=&limit=&offset=
 *
 * Paginated, newest-first listing of received Brevo marketing webhook events.
 * Feeds the "Brevo Webhook Logs" admin page (Extensions).
 */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(BREVO_WEBHOOK_LOG_MODULE)

  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100)
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0
  const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
  const event = typeof req.query.event === "string" ? req.query.event.trim() : ""

  const filters: Record<string, unknown> = {}
  if (q) filters.email = { $ilike: `%${q}%` }
  if (event) filters.event = event

  const [logs, count] = await service.listAndCountBrevoWebhookLogs(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ logs, count, limit, offset })
}
