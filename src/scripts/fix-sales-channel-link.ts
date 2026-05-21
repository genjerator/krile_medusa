import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function fixSalesChannelLink({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const allChannels = await salesChannelModule.listSalesChannels()
  logger.info(`Found ${allChannels.length} sales channels`)

  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const location = locations[0]
  logger.info(`Stock location: ${location.name} (${location.id})`)

  for (const channel of allChannels) {
    logger.info(`Linking "${channel.name}" (${channel.id}) → stock location...`)
    await remoteLink.create({
      [Modules.SALES_CHANNEL]: { sales_channel_id: channel.id },
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    }).catch(() => logger.info(`  Already linked.`))
  }

  logger.info("✅ All sales channels linked to stock location!")
}
