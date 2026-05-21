import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedC550({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC C 550 seed...")

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
  const existingParent = await productModule.listProductCategories({ handle: ["packaging-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([{
    name: "Packaging Machines",
    handle: "packaging-machines",
    description: "Industrial and commercial vacuum packaging machines",
    is_active: true,
    is_internal: false,
  }]))[0]

  const existingDouble = await productModule.listProductCategories({ handle: ["double-chamber-machines"] })
  const doubleChamberCategory = existingDouble[0] ?? (await productModule.createProductCategories([{
    name: "Double Chamber Machines",
    handle: "double-chamber-machines",
    description:
      "MULTIVAC double chamber machines — high-throughput vacuum packaging with two alternating " +
      "chambers for continuous production in butcheries, food processing, and industrial use.",
    parent_category_id: parentCategory.id,
    is_active: true,
    is_internal: false,
  }]))[0]

  // ─── PRODUCT TAGS ─────────────────────────────────────────────────────────
  logger.info("Creating product tags...")
  const tagValues = [
    "vacuum-packaging", "chamber-machine", "MAP-packaging", "food-industry",
    "MULTIVAC", "double-chamber", "doppelkammer",
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
          hs_code: (data as any).hs_code,
          mid_code: (data as any).mid_code,
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

  // ─── PRODUCT: C 550 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 550...")
  const c550 = await upsertProduct({
    title: "MULTIVAC C 550 Double Chamber Machine",
    handle: "multivac-c550-double-chamber-machine",
    subtitle: "Largest MULTIVAC double chamber machine",
    images: [
      { url: `${BASE}/products/double-chamber/c550-overview.jpg` },
      { url: `${BASE}/products/double-chamber/c550-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 550 is the largest double chamber machine in the MULTIVAC range, designed " +
      "for maximum throughput in high-volume industrial and food processing environments. " +
      "With 2 × 850 mm sealing bars and a chamber depth of 905 mm, it handles the most demanding " +
      "large-format packaging tasks.\n\n" +
      "Standard equipment includes double seam / separating seal. Optional extras include vacuum " +
      "pump (160, 250, or 300 m³/h), protective gas unit, suction throttle, and a full range " +
      "of accessories.\n\n" +
      "Specifications: Sealing bars 2 × 850 mm (2 × front and 2 × rear) | Chamber depth/width " +
      "905 mm, height 210 mm | Dimensions (closed) 1,980 × 1,225 × 1,090 mm | " +
      "Dimensions (open) 1,980 × 1,225 × 1,510 mm | Weight 730 kg | " +
      "3×400V 50Hz or 3×220V 60Hz",
    status: "published",
    weight: 730000,
    length: 1225,
    width: 1980,
    height: 1090,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [doubleChamberCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      sealing_bars: "2 × 850 mm",

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__laenge_siegelschiene_mm": "2 × 850",
      "ausstattung__kammertiefe_breite_mm": 905,
      "ausstattung__anzahl_siegelschienen": "2 × vorne u. 2 × hinten",
      "ausstattung__kammerhoehe_mm": 210,
      "ausstattung__sichtfenster_sicherheitsglas": false,
      "ausstattung__vakuumpumpe_m3h": "optional: 160 / 250 / 300",
      "ausstattung__anschluss_externe_vakuumpumpe": "optional",
      "ausstattung__maschinenmasze_geschlossen_mm": "1.980 × 1.225 × 1.090",
      "ausstattung__maschinenmasze_geoeffnet_mm": "1.980 × 1.225 × 1.510",
      "ausstattung__gewicht_kg": 730,
      "ausstattung__absaugdrossel": "optional",
      "ausstattung__schutzgaseinrichtung": "optional",

      // ─── Siegelvarianten ──────────────────────────────────────────
      "siegelvarianten__doppelnaht_trennsiegelung": true,
      "siegelvarianten__doppelnaht_siegelung": "optional",
      "siegelvarianten__einfachsiegelung": "optional",
      "siegelvarianten__einfachsiegelung_oben_unten": "optional",
      "siegelvarianten__doppelnaht_siegelung_oben_unten": false,
      "siegelvarianten__wassergekühlte_siegeleinrichtung": "optional",
      "siegelvarianten__spannung": "3×400V, 50Hz / 3×220V, 60Hz",

      // ─── Zubehör ──────────────────────────────────────────────────
      "zubehoer__schraeg_einsatz": "optional",
      "zubehoer__beutelaufblasgeraet_ba01": "optional",
      "zubehoer__fleischgabel": "optional",
      "zubehoer__fleischgabel_kaliber": "optional",
      "zubehoer__schrumpftank_se60": "optional",
      "zubehoer__gasmischer": "optional",
    },
    options: [
      {
        title: "Voltage",
        values: ["3×400V 50Hz (EU)", "3×220V 60Hz (US)"],
      },
    ],
    variants: [
      {
        title: "C 550 – Standard (400V EU)",
        sku: "MULTIVAC-C550-STD-EU",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×400V 50Hz (EU)" },
      },
      {
        title: "C 550 – Standard (220V US)",
        sku: "MULTIVAC-C550-STD-US",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×220V 60Hz (US)" },
      },
    ],
  })

  await upsertTranslation(c550.id, "de-DE", {
    title: "MULTIVAC C 550 Doppelkammermaschine",
    subtitle: "Größte MULTIVAC Doppelkammermaschine",
    description:
      "Die MULTIVAC C 550 ist die größte Doppelkammermaschine im MULTIVAC-Programm und wurde " +
      "für maximalen Durchsatz in hochvolumigen industriellen und lebensmittelverarbeitenden " +
      "Betrieben konzipiert. Mit 2 × 850 mm Siegelschienen und einer Kammertiefe von 905 mm " +
      "bewältigt sie auch die anspruchsvollsten Großformat-Verpackungsaufgaben.\n\n" +
      "Zur Standardausstattung gehört die Doppelnaht-Trennsiegelung. Optional erhältlich sind " +
      "Vakuumpumpe (160, 250 oder 300 m³/h), Schutzgaseinrichtung, Absaugdrossel sowie ein " +
      "vollständiges Zubehörprogramm.\n\n" +
      "Technische Daten: Siegelschienen 2 × 850 mm (2 × vorne u. 2 × hinten) | " +
      "Kammertiefe/-breite 905 mm, Höhe 210 mm | Abmessungen (geschlossen) 1.980 × 1.225 × 1.090 mm | " +
      "Abmessungen (geöffnet) 1.980 × 1.225 × 1.510 mm | Gewicht 730 kg | " +
      "3×400V 50Hz oder 3×220V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  logger.info("Linking C 550 to sales channel...")
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c550.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {
    logger.info(`Sales channel link for C 550 already exists, skipping.`)
  })

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  logger.info("Creating price set for C 550...")
  const c550Variants = c550.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    { variantId: c550Variants[0]?.id, amount: 45000 }, // 45,000.00 EUR — EU
    { variantId: c550Variants[1]?.id, amount: 45000 }, // 45,000.00 EUR — US
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
  logger.info(`   Category:      Packaging Machines > Double Chamber Machines`)
  logger.info(`   Products:      C 550`)
  logger.info(`   Variants:      ${c550Variants.length} × C550`)
  logger.info(`   Translations:  de-DE added`)
  logger.info("")
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
