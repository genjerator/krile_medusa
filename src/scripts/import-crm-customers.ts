import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { readFileSync } from "fs"
import { runCrmCustomerImport } from "../lib/crm-customer-import"

/**
 * CLI wrapper around the shared CRM customer import
 * (see src/lib/crm-customer-import.ts — also used by the admin
 * "Import from CSV" button on the Customers page).
 *
 * Usage:
 *   npx medusa exec ./src/scripts/import-crm-customers.ts <file.xlsx|csv> [dry-run] [only-email] [require-address] [channel=SalesChannelName]
 *
 * Note: `medusa exec` rejects --flags, so options are plain words.
 */
export default async function importCrmCustomers({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const filePath = args.find(
    (a) => !["dry-run", "only-email", "require-address"].includes(a) && !a.startsWith("channel=")
  )

  if (!filePath) {
    logger.error(
      "Usage: npx medusa exec ./src/scripts/import-crm-customers.ts <file.xlsx|csv> [dry-run] [only-email] [require-address] [channel=SalesChannelName]"
    )
    return
  }

  const stats = await runCrmCustomerImport(container, readFileSync(filePath), {
    dryRun: args.includes("dry-run"),
    onlyEmail: args.includes("only-email"),
    requireAddress: args.includes("require-address"),
    channelName: args.find((a) => a.startsWith("channel="))?.split("=")[1],
  })

  logger.info(`Import stats: ${JSON.stringify(stats, null, 2)}`)
}
