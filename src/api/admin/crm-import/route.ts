import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { runCrmCustomerImport } from "../../../lib/crm-customer-import"

/**
 * POST /admin/crm-import
 *
 * Multipart upload (field "file": .csv or .xlsx CRM export) + optional text
 * fields "dry_run", "only_email", "require_address" ("true"/"false").
 * Runs the shared CRM customer upsert and returns its stats.
 *
 * The import calls the customer module directly (same battle-tested code path
 * as the CLI script) instead of a workflow: the file is too large to round-trip
 * through the workflow engine, and the import is idempotent — re-running it is
 * always safe, which is the recovery story a compensation flow would provide.
 */
export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const file = (req as unknown as { file?: Express.Multer.File }).file

  if (!file?.buffer?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'No file uploaded — send the CSV/Excel file as multipart field "file".'
    )
  }

  const body = (req.body ?? {}) as Record<string, string>
  const flag = (name: string) => body[name] === "true"

  const stats = await runCrmCustomerImport(req.scope, file.buffer, {
    dryRun: flag("dry_run"),
    onlyEmail: flag("only_email"),
    requireAddress: flag("require_address"),
  })

  res.json({ stats })
}
