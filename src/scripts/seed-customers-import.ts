import { ExecArgs, ICustomerModuleService, ISalesChannelModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { readFileSync } from "fs"

const BATCH_SIZE = 200
const SALES_CHANNEL_NAME = "PlanetaWebshop"

type WooCustomer = {
  email: string
  first_name?: string
  last_name?: string
  country?: string
  postcode?: string
  city?: string
  state?: string
  registered_at?: string
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

export default async function seedCustomersImport({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const filePath = args[0] ?? process.env.CUSTOMERS_IMPORT_FILE
  if (!filePath) {
    logger.error(
      "No customer data file provided. Usage: medusa exec ./src/scripts/seed-customers-import.ts <path-to-json>"
    )
    return
  }

  const customers: WooCustomer[] = JSON.parse(readFileSync(filePath, "utf-8"))

  const customerModule: ICustomerModuleService = container.resolve(Modules.CUSTOMER)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  const [salesChannel] = await salesChannelModule.listSalesChannels({ name: SALES_CHANNEL_NAME })
  if (!salesChannel) {
    logger.warn(`Sales channel "${SALES_CHANNEL_NAME}" not found — skipping channel linking.`)
  }

  logger.info(`🚀 Importing ${customers.length} customers from WooCommerce export...`)

  // ─── SKIP EXISTING ────────────────────────────────────────────────────────
  const existingEmails = new Set<string>()
  for (const batch of chunk(customers, 500)) {
    const found = await customerModule.listCustomers(
      { email: batch.map((c) => c.email) },
      { select: ["email"] }
    )
    found.forEach((c) => c.email && existingEmails.add(c.email.toLowerCase()))
  }

  const toCreate = customers.filter((c) => !existingEmails.has(c.email.toLowerCase()))

  logger.info(`Skipping ${customers.length - toCreate.length} customers that already exist.`)
  logger.info(`Creating ${toCreate.length} new customers...`)

  // ─── CREATE IN BATCHES ────────────────────────────────────────────────────
  let created = 0
  for (const batch of chunk(toCreate, BATCH_SIZE)) {
    await customerModule.createCustomers(
      batch.map((c) => ({
        email: c.email,
        first_name: c.first_name ?? undefined,
        last_name: c.last_name ?? undefined,
        metadata: {
          source: "woocommerce-import",
          ...(c.country && { country: c.country }),
          ...(c.postcode && { postcode: c.postcode }),
          ...(c.city && { city: c.city }),
          ...(c.state && { state: c.state }),
          ...(c.registered_at && { registered_at: c.registered_at }),
        },
      }))
    )
    created += batch.length
    logger.info(`Created ${created}/${toCreate.length} customers...`)
  }

  logger.info(`✅ Done. Imported ${created} new customers (${existingEmails.size} already existed).`)

  // ─── LINK ALL IMPORTED CUSTOMERS TO THE PLANETA STOREFRONT CHANNEL ────────
  if (salesChannel) {
    logger.info(`Linking imported customers to the "${SALES_CHANNEL_NAME}" sales channel...`)

    let linked = 0
    for (const batch of chunk(customers, 500)) {
      const found = await customerModule.listCustomers(
        { email: batch.map((c) => c.email) },
        { select: ["id", "email"] }
      )

      for (const customer of found) {
        await remoteLink
          .create({
            [Modules.CUSTOMER]: { customer_id: customer.id },
            [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
          })
          .catch(() => {})
      }

      linked += found.length
      logger.info(`Linked ${linked}/${customers.length} customers to "${SALES_CHANNEL_NAME}"...`)
    }

    logger.info(`✅ Linked ${linked} customers to the "${SALES_CHANNEL_NAME}" sales channel.`)
  }
}
