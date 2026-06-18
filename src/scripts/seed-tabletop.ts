import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedTabletop({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC Table-Top Chamber Machines seed...")

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
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "IndustriesWebshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "IndustriesWebshop",
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

  const existingTabletop = await productModule.listProductCategories({ handle: ["tabletop-chamber-machines"] })
  const tabletopCategory = existingTabletop[0] ?? (await productModule.createProductCategories([{
    name: "Table-Top Chamber Machines",
    handle: "tabletop-chamber-machines",
    description:
      "MULTIVAC table-top chamber machines — compact, high-quality vacuum packaging for " +
      "small-scale production. Ideal for butchers, delis, catering, and light industrial use.",
    parent_category_id: parentCategory.id,
    is_active: true,
    is_internal: false,
  }]))[0]

  // ─── PRODUCT TAGS ─────────────────────────────────────────────────────────
  logger.info("Creating product tags...")
  const tagValues = [
    "vacuum-packaging", "chamber-machine", "MAP-packaging", "food-industry",
    "MULTIVAC", "tabletop", "compact",
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

  // ─── PRODUCT: C 70 ────────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 70...")
  const c70 = await upsertProduct({
    title: "MULTIVAC C 70 Table-Top Chamber Machine",
    handle: "multivac-c70-tabletop-chamber-machine",
    subtitle: "Entry-level compact vacuum packaging machine",
    images: [
      { url: `${BASE}/products/tabletop/c70-c100-overview.jpg` },
      { url: `${BASE}/products/tabletop/c70-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 70 is a cost-effective entry-level table-top chamber machine with a compact " +
      "footprint, ideal for butchers, delis, restaurants, hotels, caterers, and supermarkets with " +
      "smaller packaging volumes.\n\n" +
      "Features include the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal with a robust safety glass lid window.\n\n" +
      "Fully washdown-capable with hygienic design. Sealing bars, insert plates and inclined inserts " +
      "are tool-free removable for cleaning. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bar 1×305 mm (front) | Chamber 305×310 mm, height 120 mm | " +
      "Vacuum pump 8 m³/h | Dimensions (closed) 400×500×330 mm | Weight 50 kg | " +
      "1×230V 50Hz or 1×110V 60Hz",
    status: "published",
    weight: 50000,
    length: 500,
    width: 400,
    height: 330,
    origin_country: "de",
    material: "Stainless Steel / Safety Glass",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC 06",
      sealing_bars: "1 × 305 mm",
      vacuum_pump_m3h: 8,

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__laenge_siegelschiene_mm": "1 × 305",
      "ausstattung__kammertiefe_breite_mm": 310,
      "ausstattung__anzahl_siegelschienen": "1 × vorne",
      "ausstattung__kammerhoehe_mm": 120,
      "ausstattung__sichtfenster_sicherheitsglas": true,
      "ausstattung__vakuumpumpe_m3h": 8,
      "ausstattung__anschluss_externe_vakuumpumpe": false,
      "ausstattung__maschinenmasze_geschlossen_mm": "400 × 500 × 330",
      "ausstattung__maschinenmasze_geoeffnet_mm": "400 × 500 × 550",
      "ausstattung__gewicht_kg": 50,
      "ausstattung__absaugdrossel": false,
      "ausstattung__schutzgaseinrichtung": false,

      // ─── Siegelvarianten ──────────────────────────────────────────
      "siegelvarianten__doppelnaht_trennsiegelung": true,
      "siegelvarianten__doppelnaht_siegelung": false,
      "siegelvarianten__einfachsiegelung": false,
      "siegelvarianten__einfachsiegelung_oben_unten": false,
      "siegelvarianten__doppelnaht_siegelung_oben_unten": false,
      "siegelvarianten__spannung": "1×230V, 50Hz / 1×110V, 60Hz",

      // ─── Zubehör ──────────────────────────────────────────────────
      "zubehoer__schraeg_einsatz": false,
      "zubehoer__edelstahl_fahrgestell": "optional",
      "zubehoer__beutelaufblasgeraet_ba01": "optional",
      "zubehoer__fleischgabel": "optional",
      "zubehoer__einfuellhilfe_banknoten": false,
      "zubehoer__schrumpftank_se60": "optional",
      "zubehoer__gasmischer": false,
    },
    options: [
      {
        title: "Voltage",
        values: ["1×230V 50Hz (EU)", "1×110V 60Hz (US)"],
      },
    ],
    variants: [
      {
        title: "C 70 – Standard (230V EU)",
        sku: "MULTIVAC-C70-STD-EU",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "1×230V 50Hz (EU)" },
      },
      {
        title: "C 70 – Standard (110V US)",
        sku: "MULTIVAC-C70-STD-US",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "1×110V 60Hz (US)" },
      },
    ],
  })

  await upsertTranslation(c70.id, "de-DE", {
    title: "MULTIVAC C 70 Tischkammermaschine",
    subtitle: "Kostengünstiges Einstiegsmodell mit kompakten Abmessungen",
    description:
      "Die MULTIVAC C 70 ist ein kostengünstiges Einstiegsmodell mit kompakten Abmessungen, " +
      "ideal für Metzgereien, Käsereien, Restaurants, Hotels, Direktvermarkter und Supermärkte " +
      "mit kleineren Verpackungsmengen.\n\n" +
      "Ausgestattet mit der digitalen Elektroniksteuerung MC 06 mit Vakuumsensor, " +
      "Auto-Stopp-Funktion, Vakuum-Schnellstopp, sanfter Belüftung und 29 Produktspeicherplätzen " +
      "in 18 einstellbaren Bediensprachen. Doppelnaht-Trennsiegelung als Standardausstattung, " +
      "stabiler Kammerdeckel mit Sichtfenster aus Sicherheitsglas.\n\n" +
      "Komplett washdownfähig mit hygienegerechtem Design. Siegelschienen, Einlegeplatten und " +
      "Schrägeinsätze sind ohne Werkzeug herausnehmbar. GS-geprüft (DGUV).\n\n" +
      "Technische Daten: Siegelschiene 1×305 mm (vorne) | Kammer 305×310 mm, Höhe 120 mm | " +
      "Vakuumpumpe 8 m³/h | Abmessungen (geschlossen) 400×500×330 mm | Gewicht 50 kg | " +
      "1×230V 50Hz oder 1×110V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  logger.info("Linking C 70 to sales channel...")
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c70.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {
    logger.info(`Sales channel link for C 70 already exists, skipping.`)
  })

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  logger.info("Creating price set for C 70...")
  const c70Variants = c70.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    { variantId: c70Variants[0]?.id, amount: 4999 }, // 4,999.00 EUR — EU
    { variantId: c70Variants[1]?.id, amount: 4999 }, // 4,999.00 EUR — US
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
  logger.info(`   Category:      Packaging Machines > Table-Top Chamber Machines`)
  logger.info(`   Products:      C 70`)
  logger.info(`   Variants:      ${c70Variants.length} × C70`)
  logger.info(`   Translations:  de-DE added`)
  logger.info("")
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
