import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Reports how many customers are soft-deleted (deleted_at set) vs active, and
 * how many of the soft-deleted ones were removed because they unsubscribed /
 * were blacklisted in Brevo (the `soft-delete-unsubscribed` job). Read-only.
 *
 * Run:
 *   local — npx medusa exec ./src/scripts/count-soft-deleted-customers.ts
 *   prod  — ssh ... "docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/count-soft-deleted-customers.js'"
 */
export default async function countSoftDeletedCustomers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const res: any = await pg.raw(`
    select
      count(*) filter (where deleted_at is not null)                                   as soft_deleted_total,
      count(*) filter (where deleted_at is not null and (
        coalesce((metadata->'brevo'->>'unsubscribed')::boolean, false) or
        coalesce((metadata->'brevo'->>'blacklisted')::boolean, false)))                as soft_deleted_unsubscribed,
      count(*) filter (where deleted_at is null)                                       as active_total,
      count(*) filter (where deleted_at is null and (
        coalesce((metadata->'brevo'->>'unsubscribed')::boolean, false) or
        coalesce((metadata->'brevo'->>'blacklisted')::boolean, false)))                as active_unsubscribed
    from "customer"
  `)

  const r = res.rows?.[0] ?? {}
  logger.info("📊 Customer soft-delete / unsubscribe counts:")
  logger.info(`   Soft-deleted (total):          ${r.soft_deleted_total ?? 0}`)
  logger.info(`   Soft-deleted (unsubscribed):   ${r.soft_deleted_unsubscribed ?? 0}`)
  logger.info(`   Active (total):                ${r.active_total ?? 0}`)
  logger.info(`   Active (still unsubscribed):   ${r.active_unsubscribed ?? 0}`)
}
