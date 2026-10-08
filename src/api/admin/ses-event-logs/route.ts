import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SES_EVENT_LOG_MODULE } from "../../../modules/sesEventLog"

/**
 * GET /admin/ses-event-logs?q=&event=&limit=&offset=
 *
 * Paginated, newest-first listing of received SES marketing events (open / click /
 * delivery / bounce / complaint), the SES counterpart to /admin/brevo-webhook-logs.
 * Feeds the SES tab of the "Webhook Logs" admin page. `campaign_id` is text here
 * (the SES message tag = the weekly-action id), unlike Brevo's numeric id.
 */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(SES_EVENT_LOG_MODULE)

  const limit = Math.min(parseInt(String(req.query.limit ?? "20"), 10) || 20, 100)
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0
  const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
  const event = typeof req.query.event === "string" ? req.query.event.trim() : ""

  const filters: Record<string, unknown> = {}
  if (q) filters.email = { $ilike: `%${q}%` }
  if (event) filters.event = event

  const [logs, count] = await service.listAndCountSesEventLogs(filters, {
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  })

  res.json({ logs, count, limit, offset })
}
