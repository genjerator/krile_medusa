import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runBrevoSync } from "../lib/brevo-sync"

/**
 * Pull email-engagement stats (opens, clicks, bounces, unsubscribes) from
 * Brevo into customer.metadata.brevo for every customer with an email.
 *
 * Usage:
 *   npx medusa exec ./src/scripts/sync-brevo-stats.ts [dry-run] [limit=N] [email=someone@example.com]
 *
 * Requires BREVO_API_KEY in the environment (.env).
 * Note: `medusa exec` rejects --flags, so options are plain words.
 */
export default async function syncBrevoStats({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const limitArg = args.find((a) => a.startsWith("limit="))?.split("=")[1]
  const stats = await runBrevoSync(container, {
    dryRun: args.includes("dry-run"),
    limit: limitArg ? parseInt(limitArg, 10) : undefined,
    email: args.find((a) => a.startsWith("email="))?.split("=")[1],
  })

  logger.info(`Brevo sync stats: ${JSON.stringify(stats, null, 2)}`)
}
