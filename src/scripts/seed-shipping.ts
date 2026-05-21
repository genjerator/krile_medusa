import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule = container.resolve(Modules.PRICING)
  const regionModule = container.resolve(Modules.REGION)

  // ─── Stock location ───────────────────────────────────────────────────────
  const { data: locations } = await query.graph({ entity: "stock_location", fields: ["id", "name"] })
  const location = locations[0]
  if (!location) throw new Error("No stock location found. Create one in Admin → Settings → Locations first.")
  logger.info(`Using stock location: ${location.name} (${location.id})`)

  // ─── Sales channel ────────────────────────────────────────────────────────
  const [salesChannel] = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  if (!salesChannel) throw new Error("No 'Webshop' sales channel found.")
  logger.info(`Using sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // ─── Region ───────────────────────────────────────────────────────────────
  const [region] = await regionModule.listRegions()
  if (!region) throw new Error("No region found.")
  logger.info(`Using region: ${region.name} (${region.id})`)

  // ─── Shipping profile ─────────────────────────────────────────────────────
  const existingProfiles = await fulfillmentModule.listShippingProfiles({ type: ["default"] })
  const shippingProfile = existingProfiles[0] ?? (await fulfillmentModule.createShippingProfiles({
    name: "Default",
    type: "default",
  }))
  logger.info(`Shipping profile: ${shippingProfile.id}`)

  // ─── Fulfillment set + service zone ───────────────────────────────────────
  const existingSets = await fulfillmentModule.listFulfillmentSets(
    { name: ["Webshop Shipping"] },
    { relations: ["service_zones", "service_zones.geo_zones"] }
  )
  let fulfillmentSet = existingSets[0]

  if (!fulfillmentSet) {
    logger.info("Creating fulfillment set + service zone...")
    fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: "Webshop Shipping",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: [
            { type: "country", country_code: "de" },
            { type: "country", country_code: "at" },
            { type: "country", country_code: "ch" },
            { type: "country", country_code: "rs" },
            { type: "country", country_code: "hr" },
            { type: "country", country_code: "si" },
          ],
        },
      ],
    })
    logger.info(`Fulfillment set created: ${fulfillmentSet.id}`)
  } else {
    logger.info(`Fulfillment set exists: ${fulfillmentSet.id}`)
  }

  let serviceZone = fulfillmentSet.service_zones?.[0]
  if (!serviceZone) {
    logger.info("Service zone missing — creating...")
    const zone = await fulfillmentModule.createServiceZones({
      name: "Europe",
      fulfillment_set_id: fulfillmentSet.id,
      geo_zones: [
        { type: "country", country_code: "de" },
        { type: "country", country_code: "at" },
        { type: "country", country_code: "ch" },
        { type: "country", country_code: "rs" },
        { type: "country", country_code: "hr" },
        { type: "country", country_code: "si" },
      ],
    })
    serviceZone = zone
    logger.info(`Service zone created: ${serviceZone.id}`)
  }

  // ─── Link stock location → fulfillment set ────────────────────────────────
  await remoteLink.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  }).catch(() => logger.info("Stock location → fulfillment set link already exists."))

  // ─── Link sales channel → stock location (not directly to fulfillment set) ─
  await remoteLink.create({
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
  }).catch(() => logger.info("Sales channel → stock location link already exists."))

  // ─── Shipping options ─────────────────────────────────────────────────────
  const existingOptions = await fulfillmentModule.listShippingOptions({ service_zone: { id: [serviceZone.id] } } as any)

  const optionDefs = [
    { name: "DHL Paket",          amount: 990,  label: "DHL Paket",          code: "dhl_paket"          },
    { name: "DHL Express",        amount: 2490, label: "DHL Express",         code: "dhl_express"        },
    { name: "DHL Päckchen",       amount: 490,  label: "DHL Päckchen",        code: "dhl_paeckchen"      },
    { name: "DHL Paket International", amount: 1990, label: "DHL International", code: "dhl_international" },
  ]

  for (const def of optionDefs) {
    let option = existingOptions.find(o => o.name === def.name)

    if (!option) {
      logger.info(`Creating shipping option: ${def.name}`)
      option = await fulfillmentModule.createShippingOptions({
        name: def.name,
        price_type: "flat",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        provider_id: "manual_manual",
        type: { label: def.label, description: def.name, code: def.code },
      })
    } else {
      logger.info(`Shipping option "${def.name}" exists (${option.id})`)
    }

    // Always ensure price set is linked
    const { data: existingLinks } = await query.graph({
      entity: "shipping_option",
      filters: { id: option.id },
      fields: ["id", "calculated_price.*"],
    }).catch(() => ({ data: [] }))

    const hasPriceLink = !!(existingLinks[0] as any)?.calculated_price

    if (!hasPriceLink) {
      logger.info(`  Adding price set for ${def.name}...`)
      const [priceSet] = await pricingModule.createPriceSets([{
        prices: [{ amount: def.amount, currency_code: region.currency_code }],
      }])
      await remoteLink.create({
        [Modules.FULFILLMENT]: { shipping_option_id: option.id },
        [Modules.PRICING]: { price_set_id: priceSet.id },
      }).catch(() => logger.info(`  Price link already exists.`))
    }

    logger.info(`  ✅ ${def.name} — ${(def.amount / 100).toFixed(2)} ${region.currency_code.toUpperCase()}`)
  }

  logger.info("")
  logger.info("✅ Shipping seed complete!")
  logger.info("   Options: DHL Päckchen (€4.90) | DHL Paket (€9.90) | DHL International (€19.90) | DHL Express (€24.90)")
  logger.info("   Reload the storefront and the checkout button should now be enabled.")
}
