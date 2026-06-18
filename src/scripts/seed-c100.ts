import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedC100({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Seeding MULTIVAC C 100...")

  // ─── REGION ───────────────────────────────────────────────────────────────
  const allRegions = await regionModule.listRegions()
  const region = allRegions[0] ?? (await regionModule.createRegions([{
    name: "Europe",
    currency_code: "eur",
    countries: ["de", "at", "ch", "rs", "hr", "si"],
  }]))[0]

  // ─── LOCALES ──────────────────────────────────────────────────────────────
  const existingLocales = await translationModule.listLocales()
  const existingLocaleCodes = existingLocales.map((l: any) => l.code)
  for (const locale of [
    { code: "de-DE", name: "Deutsch" },
    { code: "en-US", name: "English" },
  ]) {
    if (!existingLocaleCodes.includes(locale.code)) {
      await translationModule.createLocales([locale])
    }
  }

  // ─── SALES CHANNEL ────────────────────────────────────────────────────────
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "IndustriesWebshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "IndustriesWebshop",
    description: "MULTIVAC machinery industriesWebshop",
  }]))[0]

  // ─── CATEGORY ─────────────────────────────────────────────────────────────
  const existingParent = await productModule.listProductCategories({ handle: ["packaging-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([{
    name: "Packaging Machines",
    handle: "packaging-machines",
    is_active: true,
    is_internal: false,
  }]))[0]

  const existingTabletop = await productModule.listProductCategories({ handle: ["tabletop-chamber-machines"] })
  const tabletopCategory = existingTabletop[0] ?? (await productModule.createProductCategories([{
    name: "Table-Top Chamber Machines",
    handle: "tabletop-chamber-machines",
    parent_category_id: parentCategory.id,
    is_active: true,
    is_internal: false,
  }]))[0]

  // ─── TAGS ─────────────────────────────────────────────────────────────────
  const tagValues = ["vacuum-packaging", "chamber-machine", "MAP-packaging", "food-industry", "MULTIVAC", "tabletop", "compact"]
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
    } else {
      await translationModule.createTranslations({
        reference_id,
        reference: "product",
        locale_code,
        translations,
      })
    }
  }

  // ─── PRODUCT: C 100 ───────────────────────────────────────────────────────
  const c100 = await upsertProduct({
    title: "MULTIVAC C 100 Table-Top Chamber Machine",
    handle: "multivac-c100-tabletop-chamber-machine",
    subtitle: "Our most compact table-top machine with optional MAP capability",
    description:
      "The MULTIVAC C 100 is our most compact table-top chamber machine that can be equipped " +
      "with a gas flushing unit (MAP). Ideal for butchers, delis, restaurants, hotels, caterers, " +
      "and supermarkets that need both vacuum sealing and modified atmosphere packaging.\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal with a robust safety glass lid window.\n\n" +
      "Fully washdown-capable with hygienic design. Sealing bars, insert plates and inclined inserts " +
      "are tool-free removable for cleaning. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bar 1×305 mm (front) | Chamber 305×310 mm, height 120 mm | " +
      "Vacuum pump 10 m³/h | Dimensions (closed) 400×500×330 mm | Weight 50 kg | " +
      "1×230V 50Hz or 1×110V 60Hz | Optional: MAP gas flushing unit (incl. bag clamp)",
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
      vacuum_pump_m3h: 10,

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__laenge_siegelschiene_mm": "1 × 305",
      "ausstattung__kammertiefe_breite_mm": 310,
      "ausstattung__anzahl_siegelschienen": "1 × vorne",
      "ausstattung__kammerhoehe_mm": 120,
      "ausstattung__sichtfenster_sicherheitsglas": true,
      "ausstattung__vakuumpumpe_m3h": 10,
      "ausstattung__anschluss_externe_vakuumpumpe": false,
      "ausstattung__maschinenmasze_geschlossen_mm": "400 × 500 × 330",
      "ausstattung__maschinenmasze_geoeffnet_mm": "400 × 500 × 550",
      "ausstattung__gewicht_kg": 50,
      "ausstattung__absaugdrossel": false,
      "ausstattung__schutzgaseinrichtung": "optional",

      // ─── Siegelvarianten ──────────────────────────────────────────
      "siegelvarianten__doppelnaht_trennsiegelung": true,
      "siegelvarianten__doppelnaht_siegelung": false,
      "siegelvarianten__einfachsiegelung": "optional",
      "siegelvarianten__einfachsiegelung_oben_unten": false,
      "siegelvarianten__doppelnaht_siegelung_oben_unten": false,
      "siegelvarianten__spannung": "1×230V, 50Hz / 1×110V, 60Hz",

      // ─── Zubehör ──────────────────────────────────────────────────
      "zubehoer__schraeg_einsatz": true,
      "zubehoer__edelstahl_fahrgestell": "optional",
      "zubehoer__beutelaufblasgeraet_ba01": "optional",
      "zubehoer__fleischgabel": "optional",
      "zubehoer__einfuellhilfe_banknoten": "optional",
      "zubehoer__schrumpftank_se60": "optional",
      "zubehoer__gasmischer": false,
    },
    options: [
      {
        title: "Protective Gas (MAP)",
        values: ["Without MAP", "With MAP System (incl. Bag Clamp)"],
      },
    ],
    variants: [
      {
        title: "C 100 – Standard (No MAP)",
        sku: "MULTIVAC-C100-STD",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Protective Gas (MAP)": "Without MAP" },
        metadata: { map_packaging: false },
      },
      {
        title: "C 100 – With MAP (incl. Bag Clamp)",
        sku: "MULTIVAC-C100-MAP",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)" },
        metadata: { map_packaging: true },
      },
    ],
  })

  await upsertTranslation(c100.id, "en-US", {
    title: "MULTIVAC C 100 Table-Top Chamber Machine",
    subtitle: "Our most compact table-top machine with optional MAP capability",
    description:
      "The MULTIVAC C 100 is our most compact table-top chamber machine that can be equipped " +
      "with a gas flushing unit (MAP). Ideal for butchers, delis, restaurants, hotels, caterers, " +
      "and supermarkets that need both vacuum sealing and modified atmosphere packaging.\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal with a robust safety glass lid window.\n\n" +
      "Fully washdown-capable with hygienic design. Sealing bars, insert plates and inclined inserts " +
      "are tool-free removable for cleaning. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bar 1×305 mm (front) | Chamber 305×310 mm, height 120 mm | " +
      "Vacuum pump 10 m³/h | Dimensions (closed) 400×500×330 mm | Weight 50 kg | " +
      "1×230V 50Hz or 1×110V 60Hz | Optional: MAP gas flushing unit (incl. bag clamp)",
  })

  await upsertTranslation(c100.id, "de-DE", {
    title: "MULTIVAC C 100 Tischkammermaschine",
    subtitle: "Unsere kompakteste Tischkammermaschine mit optionaler Begasungseinrichtung",
    description:
      "Die MULTIVAC C 100 ist unsere kompakteste Tischkammermaschine, die mit einer " +
      "Begasungseinrichtung (MAP) ausgestattet werden kann. Ideal für Metzgereien, Käsereien, " +
      "Restaurants, Hotels, Direktvermarkter und Supermärkte mit Bedarf an Vakuum- und " +
      "Schutzgasverpackung.\n\n" +
      "Ausgestattet mit der digitalen Elektroniksteuerung MC 06 mit Vakuumsensor, " +
      "Auto-Stopp-Funktion, Vakuum-Schnellstopp, sanfter Belüftung und 29 Produktspeicherplätzen " +
      "in 18 einstellbaren Bediensprachen. Doppelnaht-Trennsiegelung als Standardausstattung, " +
      "stabiler Kammerdeckel mit Sichtfenster aus Sicherheitsglas.\n\n" +
      "Komplett washdownfähig mit hygienegerechtem Design. Siegelschienen, Einlegeplatten und " +
      "Schrägeinsätze sind ohne Werkzeug herausnehmbar. GS-geprüft (DGUV).\n\n" +
      "Technische Daten: Siegelschiene 1×305 mm (vorne) | Kammer 305×310 mm, Höhe 120 mm | " +
      "Vakuumpumpe 10 m³/h | Abmessungen (geschlossen) 400×500×330 mm | Gewicht 50 kg | " +
      "1×230V 50Hz oder 1×110V 60Hz | Optional: Begasungseinrichtung inkl. Beutelklemmung",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c100.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => logger.info(`Sales channel link for C 100 already exists, skipping.`))

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  const c100Variants = c100.variants ?? []
  const pricePlaceholders = [
    { variantId: c100Variants[0]?.id, amount: 599900 }, // 5,999.00 EUR — No MAP
    { variantId: c100Variants[1]?.id, amount: 699900 }, // 6,999.00 EUR — With MAP
  ]

  for (const { variantId, amount } of pricePlaceholders) {
    if (!variantId) continue
    const [priceSet] = await pricingModule.createPriceSets([{
      prices: [{ amount, currency_code: "eur" }],
    }])
    await remoteLink.create({
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.PRICING]: { price_set_id: priceSet.id },
    }).catch(() => logger.info(`Price link for variant ${variantId} already exists, skipping.`))
  }

  logger.info("✅ C 100 seed complete!")
  logger.info(`   Region:        ${region.name}`)
  logger.info(`   Sales Channel: ${salesChannel.name}`)
  logger.info(`   Variants:      ${c100Variants.length} × C100`)
  logger.info("⚠️  Prices are placeholders — update before going live!")
}
