import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/brevo-overview?q=&limit=&offset=
 *
 * Read-only listing of customers that have synced Brevo stats
 * (customer.metadata.brevo), most-clicked first. Feeds the "Brevo Übersicht"
 * panel above the admin customer list.
 */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const q = typeof req.query.q === "string" ? req.query.q.trim() : ""
  const limit = Math.min(parseInt(String(req.query.limit ?? "10"), 10) || 10, 100)
  const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0

  // Sortable columns — whitelisted SQL expressions only, never raw user input.
  const SORT_COLUMNS: Record<string, string> = {
    email: "email",
    campaigns: "coalesce((metadata -> 'brevo' ->> 'campaigns_sent')::int, 0)",
    opened: "coalesce((metadata -> 'brevo' ->> 'campaigns_opened')::int, 0)",
    clicks: "coalesce((metadata -> 'brevo' ->> 'campaigns_clicked')::int, 0)",
    bounces:
      "coalesce((metadata -> 'brevo' ->> 'hard_bounces')::int, 0) + coalesce((metadata -> 'brevo' ->> 'soft_bounces')::int, 0)",
    created: "created_at",
    synced: "metadata -> 'brevo' ->> 'synced_at'",
  }
  const sortKey = SORT_COLUMNS[String(req.query.order ?? "clicks")] ? String(req.query.order ?? "clicks") : "clicks"
  const dir = String(req.query.dir ?? "desc") === "asc" ? "asc" : "desc"

  // "-> 'brevo' is not null" instead of the jsonb "?" operator: knex's "?"
  // escaping is unreliable in queries that end up with no other bindings.
  const base = pg("customer")
    .whereNull("deleted_at")
    .whereRaw("metadata -> 'brevo' is not null")
    .modify((query) => {
      if (q) {
        query.andWhere((b) =>
          b
            .whereILike("email", `%${q}%`)
            .orWhereILike("first_name", `%${q}%`)
            .orWhereILike("last_name", `%${q}%`)
            .orWhereILike("company_name", `%${q}%`)
        )
      }
    })

  const [{ count }] = await base.clone().count<{ count: string }[]>("id as count")

  const rows = await base
    .clone()
    .select(
      "id",
      "email",
      "first_name",
      "last_name",
      "company_name",
      "created_at",
      pg.raw("metadata -> 'brevo' as brevo")
    )
    .orderByRaw(`${SORT_COLUMNS[sortKey]} ${dir} nulls last, email asc`)
    .limit(limit)
    .offset(offset)

  res.json({ customers: rows, count: parseInt(count, 10), limit, offset })
}
