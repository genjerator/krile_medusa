import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { OUTREACH_MODULE } from "../../../../modules/outreach"

/**
 * GET /admin/outreach/companies — paginated, filterable list of scraped B2B
 * leads (see docs/company-outreach-system.md). Read-only browse for the admin
 * Companies page.
 *
 * Query params:
 *   q            free-text, matches name OR email OR website (ILIKE)
 *   city         matches city (ILIKE)
 *   has_website  "yes" → only rows with a website; "no" → only rows without
 *   limit/offset pagination (default 20 / 0)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const outreach: any = req.scope.resolve(OUTREACH_MODULE)

  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0
  const q = (req.query.q as string | undefined)?.trim()
  const city = (req.query.city as string | undefined)?.trim()
  const hasWebsite = req.query.has_website as string | undefined

  const filters: Record<string, any> = {}
  if (q) {
    filters.$or = [
      { name: { $ilike: `%${q}%` } },
      { email: { $ilike: `%${q}%` } },
      { website: { $ilike: `%${q}%` } },
    ]
  }
  if (city) filters.city = { $ilike: `%${city}%` }
  if (hasWebsite === "yes") filters.website = { $ne: null }
  else if (hasWebsite === "no") filters.website = null

  const [companies, count] = await outreach.listAndCountOutreachCompanies(filters, {
    select: [
      "id",
      "external_id",
      "name",
      "category",
      "street",
      "postal_code",
      "city",
      "phone",
      "website",
      "email",
      "source_url",
      "website_status",
      "website_http_code",
      "scraped_at",
    ],
    take: limit,
    skip: offset,
    order: { city: "ASC", name: "ASC" },
  })

  return res.json({ companies, count, limit, offset })
}
