import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/outreach/companies/categories — distinct `category` values present
 * in `outreach_company`, with a row count each, most-common first. Powers the
 * category dropdown filter on the admin Companies page. Read-only.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const result: any = await pg.raw(`
    select btrim(category) as category, count(*)::int as count
    from "outreach_company"
    where category is not null and btrim(category) <> ''
    group by btrim(category)
    order by count desc, category asc
  `)

  const categories: Array<{ category: string; count: number }> = result.rows ?? []
  return res.json({ categories })
}
