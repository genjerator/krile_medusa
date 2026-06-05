import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedP100({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC BASELINE P 100 seed...")

  // ─── REGION ───────────────────────────────────────────────────────────────
  const allRegions = await regionModule.listRegions()
  const region = allRegions[0] ?? (await regionModule.createRegions([{
    name: "Europe",
    currency_code: "eur",
    countries: ["de", "at", "ch", "rs", "hr", "si"],
  }]))[0]

  // ─── LOCALES ──────────────────────────────────────────────────────────────
  logger.info("Setting up locales...")
  const existingLocales = await translationModule.listLocales()
  const existingLocaleCodes = existingLocales.map((l: any) => l.code)
  for (const locale of [
    { code: "de-DE", name: "Deutsch" },
    { code: "en-US", name: "English" },
  ]) {
    if (!existingLocaleCodes.includes(locale.code)) {
      await translationModule.createLocales([locale])
      logger.info(`Created locale: ${locale.code}`)
    }
  }

  // ─── SALES CHANNEL ────────────────────────────────────────────────────────
  logger.info("Resolving sales channel...")
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "Webshop",
    description: "MULTIVAC machinery webshop",
  }]))[0]

  // ─── PRODUCT CATEGORIES ───────────────────────────────────────────────────
  logger.info("Creating product categories...")
  const existingParent = await productModule.listProductCategories({ handle: ["chamber-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([{
    name: "Chamber Machines",
    handle: "chamber-machines",
    description: "MULTIVAC vacuum chamber machines for food and non-food packaging",
    is_active: true,
    is_internal: false,
  }]))[0]

  const existingTable = await productModule.listProductCategories({ handle: ["tabletop-machines"] })
  const tabletopCategory = existingTable[0] ?? (await productModule.createProductCategories([{
    name: "Tabletop Machines",
    handle: "tabletop-machines",
    description:
      "MULTIVAC BASELINE tabletop chamber machines — compact and easy to use, " +
      "ideal for small to medium production volumes in butcheries, delis, and food retail.",
    parent_category_id: parentCategory.id,
    is_active: true,
    is_internal: false,
  }]))[0]

  // ─── PRODUCT TAGS ─────────────────────────────────────────────────────────
  logger.info("Creating product tags...")
  const tagValues = [
    "vacuum-packaging", "chamber-machine", "tabletop", "tischmaschine",
    "MULTIVAC", "BASELINE", "p-series", "compact",
  ]
  const existingTags = await productModule.listProductTags({ value: tagValues })
  const existingTagValues = existingTags.map((t) => t.value)
  const newTagValues = tagValues.filter((v) => !existingTagValues.includes(v))
  const newTags = newTagValues.length > 0
    ? await productModule.createProductTags(newTagValues.map((value) => ({ value })))
    : []
  const tagIds = [...existingTags, ...newTags].map((t) => ({ id: t.id }))

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const upsertProduct = async (data: CreateProductDTO & Record<string, unknown>): Promise<any> => {
    const { data: found } = await query.graph({
      entity: "product",
      filters: { handle: data.handle! },
      fields: ["id", "variants.*"],
    })
    if (found[0]) {
      logger.info(`Product "${data.handle}" exists — updating...`)
      await productModule.updateProducts(
        { id: (found[0] as any).id },
        {
          title: (data as any).title,
          subtitle: (data as any).subtitle,
          description: (data as any).description,
          status: (data as any).status,
          metadata: (data as any).metadata,
          weight: (data as any).weight,
          height: (data as any).height,
          length: (data as any).length,
          width: (data as any).width,
          origin_country: (data as any).origin_country,
          material: (data as any).material,
        }
      )
      return found[0]
    }
    logger.info(`Creating product "${data.handle}"...`)
    const [created] = await productModule.createProducts([data])
    return created
  }

  const upsertTranslation = async (
    reference_id: string,
    locale_code: string,
    translations: Record<string, string>
  ) => {
    const existing = await translationModule.listTranslations({
      reference_id,
      reference: "product",
      locale_code,
    })
    if (existing[0]) {
      await translationModule.updateTranslations({ id: existing[0].id, translations })
      logger.info(`Updated ${locale_code} translation for ${reference_id}`)
    } else {
      await translationModule.createTranslations({
        reference_id,
        reference: "product",
        locale_code,
        translations,
      })
      logger.info(`Created ${locale_code} translation for ${reference_id}`)
    }
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:9000/static"

  // ─── PRODUCT: P 100 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC BASELINE P 100...")
  const p100 = await upsertProduct({
    title: "MULTIVAC BASELINE P 100",
    handle: "multivac-baseline-p100",
    subtitle: "Compact tabletop vacuum chamber machine",
    images: [
      { url: `${BASE}/products/tabletop/p100-overview.jpg` },
      { url: `${BASE}/products/tabletop/p100-spec.jpg` },
    ],
    description:
      "The MULTIVAC BASELINE P 100 is a compact tabletop vacuum chamber machine, ideal for " +
      "small production volumes in butcheries, delis, and food retail. With a usable chamber " +
      "volume of 290 × 205 × 90 mm and a pump capacity of 4 m³/h, it delivers reliable " +
      "vacuum packaging in a minimal footprint.\n\n" +
      "The P 100 features 3 programmable memory slots, simple lid-close operation, and automatic " +
      "lid opening after each cycle. The machine meets GS safety standards and is easy to clean.\n\n" +
      "Specifications: Chamber volume 290 × 205 × 90 mm | Pump capacity 4 m³/h | " +
      "Form factor: Tabletop | Power supply: 230V 50Hz",
    status: "published",
    weight: 19000,
    length: 370,
    width: 300,
    height: 210,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "BASELINE P-Series",
      bauform: "Tischmaschine",

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__nutzbares_volumen_mm": "290 × 205 × 90",
      "ausstattung__kammertiefe_mm": 290,
      "ausstattung__kammerbreite_mm": 205,
      "ausstattung__kammerhoehe_mm": 90,
      "ausstattung__pumpenleistung_m3h": 4,
      "ausstattung__programme": 3,
      "ausstattung__spannung": "230V, 50Hz",

      // ─── Zubehör ──────────────────────────────────────────────────
      "zubehoer__fahrgestell": "optional",
    },
    options: [
      {
        title: "Voltage",
        values: ["230V 50Hz (EU)"],
      },
    ],
    variants: [
      {
        title: "P 100 – Standard (230V EU)",
        sku: "MULTIVAC-P100-STD-EU",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "230V 50Hz (EU)" },
      },
    ],
  })

  await upsertTranslation(p100.id, "de-DE", {
    title: "MULTIVAC BASELINE P 100",
    subtitle: "Kompakte Tischkammermaschine",
    description:
      "Die MULTIVAC BASELINE P 100 ist eine kompakte Tischkammermaschine, ideal für kleine " +
      "Produktionsmengen in Metzgereien, Feinkostbetrieben und dem Lebensmitteleinzelhandel. " +
      "Mit einem nutzbaren Kammervolumen von 290 × 205 × 90 mm und einer Pumpenleistung von " +
      "4 m³/h bietet sie zuverlässiges Vakuumverpacken auf kleinstem Raum.\n\n" +
      "Die P 100 verfügt über 3 programmierbare Speicherplätze, eine einfache Deckelschlussbedienung " +
      "und öffnet den Deckel nach jedem Zyklus automatisch. Die Maschine trägt das GS-Prüfzeichen " +
      "und ist einfach zu reinigen.\n\n" +
      "Technische Daten: Nutzbares Kammervolumen 290 × 205 × 90 mm | Pumpenleistung 4 m³/h | " +
      "Bauform: Tischmaschine | Spannung: 230V 50Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  logger.info("Linking P 100 to sales channel...")
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: p100.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {
    logger.info(`Sales channel link for P 100 already exists, skipping.`)
  })

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  logger.info("Creating price set for P 100...")
  const p100Variants = p100.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    { variantId: p100Variants[0]?.id, amount: 1500 }, // 1,500.00 EUR — placeholder
  ]

  for (const { variantId, amount } of pricePlaceholders) {
    if (!variantId) continue
    const [priceSet] = await pricingModule.createPriceSets([{
      prices: [{ amount, currency_code: "eur" }],
    }])
    await remoteLink.create({
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.PRICING]: { price_set_id: priceSet.id },
    }).catch(() => {
      logger.info(`Price link for variant ${variantId} already exists, skipping.`)
    })
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  logger.info("✅ Seed complete! Summary:")
  logger.info(`   Region:        ${region.name} (${region.id})`)
  logger.info(`   Sales Channel: ${salesChannel.name} (${salesChannel.id})`)
  logger.info(`   Category:      Chamber Machines > Tabletop Machines`)
  logger.info(`   Products:      BASELINE P 100`)
  logger.info(`   Variants:      ${p100Variants.length} × P100`)
  logger.info(`   Translations:  de-DE added`)
  logger.info("")
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
