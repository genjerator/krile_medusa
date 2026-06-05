import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedP400({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC BASELINE P 400 seed...")

  const allRegions = await regionModule.listRegions()
  const region = allRegions[0] ?? (await regionModule.createRegions([{
    name: "Europe", currency_code: "eur", countries: ["de", "at", "ch", "rs", "hr", "si"],
  }]))[0]

  const existingLocales = await translationModule.listLocales()
  const existingLocaleCodes = existingLocales.map((l: any) => l.code)
  for (const locale of [{ code: "de-DE", name: "Deutsch" }, { code: "en-US", name: "English" }]) {
    if (!existingLocaleCodes.includes(locale.code)) await translationModule.createLocales([locale])
  }

  const existingChannels = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "Webshop", description: "MULTIVAC machinery webshop",
  }]))[0]

  const existingParent = await productModule.listProductCategories({ handle: ["chamber-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([{
    name: "Chamber Machines", handle: "chamber-machines",
    description: "MULTIVAC vacuum chamber machines for food and non-food packaging",
    is_active: true, is_internal: false,
  }]))[0]

  const existingFloor = await productModule.listProductCategories({ handle: ["floor-chamber-machines"] })
  const floorCategory = existingFloor[0] ?? (await productModule.createProductCategories([{
    name: "Floor Chamber Machines", handle: "floor-chamber-machines",
    description: "MULTIVAC BASELINE floor-standing chamber machines — high throughput for production environments.",
    parent_category_id: parentCategory.id, is_active: true, is_internal: false,
  }]))[0]

  const tagValues = ["vacuum-packaging", "chamber-machine", "standmaschine", "floor-standing", "MULTIVAC", "BASELINE", "p-series", "high-throughput"]
  const existingTags = await productModule.listProductTags({ value: tagValues })
  const existingTagValues = existingTags.map((t) => t.value)
  const newTags = tagValues.filter((v) => !existingTagValues.includes(v)).length > 0
    ? await productModule.createProductTags(tagValues.filter((v) => !existingTagValues.includes(v)).map((value) => ({ value })))
    : []
  const tagIds = [...existingTags, ...newTags].map((t) => ({ id: t.id }))

  const upsertProduct = async (data: CreateProductDTO & Record<string, unknown>): Promise<any> => {
    const { data: found } = await query.graph({ entity: "product", filters: { handle: data.handle! }, fields: ["id", "variants.*"] })
    if (found[0]) {
      await productModule.updateProducts({ id: (found[0] as any).id }, {
        title: (data as any).title, subtitle: (data as any).subtitle, description: (data as any).description,
        status: (data as any).status, metadata: (data as any).metadata, weight: (data as any).weight,
        height: (data as any).height, length: (data as any).length, width: (data as any).width,
        origin_country: (data as any).origin_country, material: (data as any).material,
      })
      return found[0]
    }
    const [created] = await productModule.createProducts([data])
    return created
  }

  const upsertTranslation = async (reference_id: string, locale_code: string, translations: Record<string, string>) => {
    const existing = await translationModule.listTranslations({ reference_id, reference: "product", locale_code })
    if (existing[0]) { await translationModule.updateTranslations({ id: existing[0].id, translations }) }
    else { await translationModule.createTranslations({ reference_id, reference: "product", locale_code, translations }) }
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:9000/static"

  const p400 = await upsertProduct({
    title: "MULTIVAC BASELINE P 400",
    handle: "multivac-baseline-p400",
    subtitle: "Floor-standing vacuum chamber machine for high-volume production",
    images: [
      { url: `${BASE}/products/floor/p400-overview.jpg` },
      { url: `${BASE}/products/floor/p400-spec.jpg` },
    ],
    description:
      "The MULTIVAC BASELINE P 400 is a floor-standing vacuum chamber machine designed for " +
      "high-volume production environments. With a pump capacity of 60 m³/h and chamber volume " +
      "of 420 × 425 × 170 mm, it offers significantly faster cycle times than tabletop models.\n\n" +
      "Features include Doppelnaht-Trennsiegelung sealing, a 420 mm plug-in sealing bar, MCB01 " +
      "control unit, optional gas flushing for MAP packaging, and three-phase power supply for " +
      "industrial environments.\n\n" +
      "Specifications: Chamber volume 420 × 425 × 170 mm | Machine dimensions 520 × 650 × 980 mm | " +
      "Weight 105 kg | Pump capacity 60 m³/h | Sealing length 420 mm | 3×400V 50Hz / 3×220V 60Hz",
    status: "published",
    weight: 105000,
    length: 650,
    width: 520,
    height: 980,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [floorCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "BASELINE P-Series",
      bauform: "Standmaschine",
      "ausstattung__kammerabmessung_mm": "420 × 425 × 170",
      "ausstattung__maschinenabmessung_mm": "520 × 650 × 980",
      "ausstattung__gewicht_kg": 105,
      "ausstattung__pumpenleistung_m3h": 60,
      "ausstattung__siegelung": "Doppelnaht-Trennsiegelung 1×3mm, 1×1mm",
      "ausstattung__siegelschiene": "steckbar",
      "ausstattung__nutzbare_siegellaenge_mm": 420,
      "ausstattung__steuerung": "MCB01",
      "ausstattung__spannung": "3×400V 50Hz / 3×220V 60Hz",
      "optionen__begasungseinrichtung": "optional",
    },
    options: [{ title: "Voltage", values: ["3×400V 50Hz (EU)", "3×220V 60Hz (US)"] }],
    variants: [
      { title: "P 400 – Standard (400V EU)", sku: "MULTIVAC-P400-STD-EU", manage_inventory: false, allow_backorder: true, options: { "Voltage": "3×400V 50Hz (EU)" } },
      { title: "P 400 – Standard (220V US)", sku: "MULTIVAC-P400-STD-US", manage_inventory: false, allow_backorder: true, options: { "Voltage": "3×220V 60Hz (US)" } },
    ],
  })

  await upsertTranslation(p400.id, "de-DE", {
    title: "MULTIVAC BASELINE P 400",
    subtitle: "Standkammermaschine für hohe Produktionsvolumen",
    description:
      "Die MULTIVAC BASELINE P 400 ist eine Standkammermaschine für hohe Produktionsvolumen. " +
      "Mit einer Pumpenleistung von 60 m³/h und einem Kammervolumen von 420 × 425 × 170 mm " +
      "ermöglicht sie deutlich kürzere Zykluszeiten als Tischmodelle.\n\n" +
      "Ausstattung: Doppelnaht-Trennsiegelung, steckbare Siegelschiene 420 mm, MCB01-Steuerung, " +
      "optionale Begasungseinrichtung für MAP-Packungen, Drehstromversorgung für den " +
      "industriellen Einsatz.\n\n" +
      "Technische Daten: Kammervolumen 420 × 425 × 170 mm | Maschinenabmessung 520 × 650 × 980 mm | " +
      "Gewicht 105 kg | Pumpenleistung 60 m³/h | Siegellänge 420 mm | 3×400V 50Hz / 3×220V 60Hz",
  })

  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: p400.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {})

  const p400Variants = p400.variants ?? []
  for (const { variantId, amount } of [
    { variantId: p400Variants[0]?.id, amount: 8000 },
    { variantId: p400Variants[1]?.id, amount: 8000 },
  ]) {
    if (!variantId) continue
    const [priceSet] = await pricingModule.createPriceSets([{ prices: [{ amount, currency_code: "eur" }] }])
    await remoteLink.create({ [Modules.PRODUCT]: { variant_id: variantId }, [Modules.PRICING]: { price_set_id: priceSet.id } }).catch(() => {})
  }

  logger.info("✅ BASELINE P 400 seed complete!")
  logger.info(`   Region:        ${region.name} (${region.id})`)
  logger.info(`   Sales Channel: ${salesChannel.name} (${salesChannel.id})`)
  logger.info(`   Category:      Chamber Machines > Floor Chamber Machines`)
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
