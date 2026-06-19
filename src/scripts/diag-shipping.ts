import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function diag({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const sets = await fulfillment.listFulfillmentSets(
    {},
    { relations: ["service_zones", "service_zones.geo_zones"] }
  )
  logger.info(`Fulfillment sets: ${sets.length}`)
  for (const s of sets) {
    logger.info(`  SET "${s.name}" (${s.id}) type=${s.type}`)
    for (const z of s.service_zones ?? []) {
      const countries = (z.geo_zones ?? []).map((g: any) => g.country_code).join(",")
      logger.info(`    ZONE "${z.name}" (${z.id}) countries=[${countries}]`)
    }
  }

  const zones = await fulfillment.listServiceZones({}, { relations: ["fulfillment_set"] })
  logger.info(`Service zones total: ${zones.length}`)
  for (const z of zones) {
    logger.info(`  ZONE "${z.name}" (${z.id}) set=${(z as any).fulfillment_set?.id ?? "NONE"}`)
  }

  const opts = await fulfillment.listShippingOptions({}, { relations: ["service_zone"] })
  logger.info(`Shipping options total: ${opts.length}`)
  for (const o of opts) {
    logger.info(`  OPT "${o.name}" (${o.id}) zone=${(o as any).service_zone?.name} provider=${(o as any).provider_id}`)
  }

  const { data: locs } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "fulfillment_sets.id", "fulfillment_sets.name"],
  })
  for (const l of locs) {
    logger.info(`  LOC "${l.name}" sets=${(l as any).fulfillment_sets?.map((f: any) => f.name).join(",")}`)
  }
}
