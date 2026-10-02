import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SES_EMAILS_MODULE } from "../../../modules/sesEmails"

/**
 * GET /admin/ses-emails?batch_id=…  (or ?source_id=…)
 * Lists outbox rows for the prototype page.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const sesEmails: any = req.scope.resolve(SES_EMAILS_MODULE)

  const filters: Record<string, string> = {}
  const batchId = typeof req.query.batch_id === "string" ? req.query.batch_id : ""
  const sourceId = typeof req.query.source_id === "string" ? req.query.source_id : ""
  if (batchId) filters.batch_id = batchId
  else if (sourceId) filters.source_id = sourceId

  const emails = await sesEmails.listSesEmails(filters, {
    order: { to_email: "ASC" },
    take: 1000,
  })

  res.json({ emails, count: emails.length })
}
