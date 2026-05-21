import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function fixSalesChannelLink({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const [salesChannel] = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  logger.info(`Sales channel: ${salesChannel.id}`)

  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const location = locations[0]
  logger.info(`Stock location: ${location.id}`)

  logger.info("Creating sales_channel → stock_location link...")
  await remoteLink.create({
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
  })

  logger.info("✅ Link created! Check sales_channel_stock_location table.")
}
