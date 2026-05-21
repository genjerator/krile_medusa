import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedC500({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC C 500 seed...")

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

  // ─── PRODUCT: C 500 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 500...")
  const c500 = await upsertProduct({
    title: "MULTIVAC C 500 Double Chamber Machine",
    handle: "multivac-c500-double-chamber-machine",
    subtitle: "Variably configurable double chamber machine with swing lid",
    images: [
      { url: `${BASE}/products/double-chamber/c500-overview.jpg` },
      { url: `${BASE}/products/double-chamber/c500-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 500 is a variably configurable double chamber machine with swing lid, " +
      "offering a wide range of equipment options to match demanding production requirements. " +
      "With 2 × 650 mm sealing bars and a large chamber depth of 745 mm, it handles bulk " +
      "and oversized products with ease.\n\n" +
      "Standard equipment includes double seam / separating seal. The chamber height can be " +
      "configured to 110, 200, or 250 mm. Optional extras include vacuum pump (100–300 m³/h), " +
      "protective gas unit, suction throttle, and a full range of accessories.\n\n" +
      "Specifications: Sealing bars 2 × 650 mm (2 × front and 2 × rear) | Chamber depth/width " +
      "745 mm, height 200 mm (opt. 110 / 250) | Dimensions (closed) 1,600 × 1,055 × 1,045 mm | " +
      "Dimensions (open) 1,600 × 1,055 × 1,365 mm | Weight 650 kg | " +
      "3×400V 50Hz or 3×220V 60Hz",
    status: "published",
    weight: 650000,
    length: 1055,
    width: 1600,
    height: 1045,
    origin_country: "de",
    material: "Stainless Steel",
    category_ids: [doubleChamberCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      sealing_bars: "2 × 650 mm",

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__laenge_siegelschiene_mm": "2 × 650",
      "ausstattung__kammertiefe_breite_mm": 745,
      "ausstattung__anzahl_siegelschienen": "2 × vorne u. 2 × hinten",
      "ausstattung__kammerhoehe_mm": "200 (opt. 110 / 250)",
      "ausstattung__sichtfenster_sicherheitsglas": "optional",
      "ausstattung__vakuumpumpe_m3h": "optional: 100 / 150 / 160 / 250 / 300",
      "ausstattung__anschluss_externe_vakuumpumpe": "optional",
      "ausstattung__maschinenmasze_geschlossen_mm": "1.600 × 1.055 × 1.045",
      "ausstattung__maschinenmasze_geoeffnet_mm": "1.600 × 1.055 × 1.365",
      "ausstattung__gewicht_kg": 650,
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
        title: "C 500 – Standard (400V EU)",
        sku: "MULTIVAC-C500-STD-EU",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×400V 50Hz (EU)" },
      },
      {
        title: "C 500 – Standard (220V US)",
        sku: "MULTIVAC-C500-STD-US",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×220V 60Hz (US)" },
      },
    ],
  })

  await upsertTranslation(c500.id, "de-DE", {
    title: "MULTIVAC C 500 Doppelkammermaschine",
    subtitle: "Variabel ausstattbare Doppelkammermaschine mit Schwingdeckel",
    description:
      "Die MULTIVAC C 500 ist eine variabel ausstattbare Doppelkammermaschine mit Schwingdeckel " +
      "und bietet ein breites Spektrum an Ausstattungsoptionen für anspruchsvolle " +
      "Produktionsanforderungen. Mit 2 × 650 mm Siegelschienen und einer großen Kammertiefe von " +
      "745 mm eignet sie sich auch für sperrige und großvolumige Produkte.\n\n" +
      "Zur Standardausstattung gehört die Doppelnaht-Trennsiegelung. Die Kammerhöhe ist in den " +
      "Varianten 110, 200 oder 250 mm wählbar. Optional erhältlich sind Vakuumpumpe " +
      "(100–300 m³/h), Schutzgaseinrichtung, Absaugdrossel sowie ein vollständiges " +
      "Zubehörprogramm.\n\n" +
      "Technische Daten: Siegelschienen 2 × 650 mm (2 × vorne u. 2 × hinten) | " +
      "Kammertiefe/-breite 745 mm, Höhe 200 mm (opt. 110 / 250) | " +
      "Abmessungen (geschlossen) 1.600 × 1.055 × 1.045 mm | " +
      "Abmessungen (geöffnet) 1.600 × 1.055 × 1.365 mm | Gewicht 650 kg | " +
      "3×400V 50Hz oder 3×220V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  logger.info("Linking C 500 to sales channel...")
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c500.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {
    logger.info(`Sales channel link for C 500 already exists, skipping.`)
  })

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  logger.info("Creating price set for C 500...")
  const c500Variants = c500.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    { variantId: c500Variants[0]?.id, amount: 35000 }, // 35,000.00 EUR — EU
    { variantId: c500Variants[1]?.id, amount: 35000 }, // 35,000.00 EUR — US
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
  logger.info(`   Products:      C 500`)
  logger.info(`   Variants:      ${c500Variants.length} × C500`)
  logger.info(`   Translations:  de-DE added`)
  logger.info("")
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
