import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedC200({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Seeding MULTIVAC C 200...")

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
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([{
    name: "Webshop",
    description: "MULTIVAC machinery webshop",
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

  // ─── PRODUCT: C 200 ───────────────────────────────────────────────────────
  const c200 = await upsertProduct({
    title: "MULTIVAC C 200 Table-Top Chamber Machine",
    handle: "multivac-c200-tabletop-chamber-machine",
    subtitle: "Table-top machine with an especially spacious chamber",
    description:
      "The MULTIVAC C 200 is a table-top chamber machine with an especially spacious chamber " +
      "(465 × 355 mm), ideal for larger portions, whole joints, and retail-ready trays. " +
      "The chamber height can optionally be extended to 220 mm using a stainless steel lid " +
      "(without safety glass window).\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal, safety glass lid window, and tilted insert. " +
      "Optional MAP gas flushing unit with bag clamp.\n\n" +
      "Fully washdown-capable with hygienic design. Sealing bars, insert plates and inclined inserts " +
      "are tool-free removable for cleaning. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bar 1×465 mm (front) | Chamber 465×355 mm, height 150 mm (opt. 220 mm) | " +
      "Vacuum pump 21 m³/h | Dimensions (closed) 570×525×360 mm | Weight 70 kg | " +
      "1×230V 50Hz or 1×110V 60Hz",
    status: "published",
    weight: 70000,
    length: 525,
    width: 570,
    height: 360,
    origin_country: "de",
    material: "Stainless Steel / Safety Glass",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC 06",
      chamber_seal_length_mm: 465,
      chamber_width_mm: 355,
      chamber_height_mm: 150,
      chamber_height_extended_mm: 220,
      sealing_bars: "1 × 465 mm",
      sealing_bar_count: 1,
      sealing_bar_position: "front",
      sealing_type: "Doppelnaht-Trennsiegelung",
      vacuum_pump_m3h: 21,
      external_vacuum_pump: true,
      machine_dimensions_closed: "570 × 525 × 360 mm",
      machine_dimensions_open: "570 × 525 × 640 mm",
      weight_kg: 70,
      voltage: "1×230V 50Hz / 1×110V 60Hz",
      map_capable: true,
      map_includes_bag_clamp: true,
      safety_glass_window: true,
      tilted_insert: true,
      washdown_capable: true,
      program_storage: 29,
      display_languages: 18,
      auto_stop: true,
      vacuum_quick_stop: true,
      soft_ventilation: true,
      gs_certified: true,
      dguv_certified: true,
      shrink_tank_se60: "optional",
      target_industries: "Metzgereien, Käsereien, Restaurants, Hotels, Direktvermarkter, Supermärkte",
    },
    options: [
      {
        title: "Chamber Height",
        values: ["150 mm (Standard, Glass Lid)", "220 mm (Extended, Stainless Lid)"],
      },
      {
        title: "Protective Gas (MAP)",
        values: ["Without MAP", "With MAP System (incl. Bag Clamp)"],
      },
    ],
    variants: [
      {
        title: "C 200 – Standard (150mm, No MAP)",
        sku: "MULTIVAC-C200-STD-150",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Chamber Height": "150 mm (Standard, Glass Lid)", "Protective Gas (MAP)": "Without MAP" },
        metadata: { chamber_height_mm: 150, map_packaging: false },
      },
      {
        title: "C 200 – With MAP (150mm)",
        sku: "MULTIVAC-C200-MAP-150",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Chamber Height": "150 mm (Standard, Glass Lid)", "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)" },
        metadata: { chamber_height_mm: 150, map_packaging: true },
      },
      {
        title: "C 200 – Extended Chamber (220mm, No MAP)",
        sku: "MULTIVAC-C200-EXT-220",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Chamber Height": "220 mm (Extended, Stainless Lid)", "Protective Gas (MAP)": "Without MAP" },
        metadata: { chamber_height_mm: 220, map_packaging: false, stainless_lid: true },
      },
      {
        title: "C 200 – Extended Chamber + MAP (220mm)",
        sku: "MULTIVAC-C200-EXT-220-MAP",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Chamber Height": "220 mm (Extended, Stainless Lid)", "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)" },
        metadata: { chamber_height_mm: 220, map_packaging: true, stainless_lid: true },
      },
    ],
  })

  await upsertTranslation(c200.id, "en-US", {
    title: "MULTIVAC C 200 Table-Top Chamber Machine",
    subtitle: "Table-top machine with an especially spacious chamber",
    description:
      "The MULTIVAC C 200 is a table-top chamber machine with an especially spacious chamber " +
      "(465 × 355 mm), ideal for larger portions, whole joints, and retail-ready trays. " +
      "The chamber height can optionally be extended to 220 mm using a stainless steel lid.\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal, safety glass lid window, and tilted insert. " +
      "Optional MAP gas flushing unit with bag clamp.\n\n" +
      "Fully washdown-capable with hygienic design. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bar 1×465 mm (front) | Chamber 465×355 mm, height 150 mm (opt. 220 mm) | " +
      "Vacuum pump 21 m³/h | Dimensions (closed) 570×525×360 mm | Weight 70 kg | " +
      "1×230V 50Hz or 1×110V 60Hz",
  })

  await upsertTranslation(c200.id, "de-DE", {
    title: "MULTIVAC C 200 Tischkammermaschine",
    subtitle: "Tischkammermaschine mit besonders geräumiger Kammer",
    description:
      "Die MULTIVAC C 200 ist eine Tischkammermaschine mit einer besonders geräumigen Kammer " +
      "(465 × 355 mm), ideal für größere Portionen, ganze Braten und Thekenfertigschalen. " +
      "Die Kammerhöhe kann optional auf 220 mm erweitert werden (Edelstahldeckel ohne Sichtfenster).\n\n" +
      "Ausgestattet mit der digitalen Elektroniksteuerung MC 06 mit Vakuumsensor, " +
      "Auto-Stopp-Funktion, Vakuum-Schnellstopp, sanfter Belüftung und 29 Produktspeicherplätzen " +
      "in 18 einstellbaren Bediensprachen. Doppelnaht-Trennsiegelung, Sichtfenster aus Sicherheitsglas " +
      "und Schrägeinsatz als Standard. Optionale Begasungseinrichtung (MAP) inkl. Beutelklemmung.\n\n" +
      "Komplett washdownfähig. GS-geprüft (DGUV).\n\n" +
      "Technische Daten: Siegelschiene 1×465 mm (vorne) | Kammer 465×355 mm, Höhe 150 mm (opt. 220 mm) | " +
      "Vakuumpumpe 21 m³/h | Abmessungen (geschlossen) 570×525×360 mm | Gewicht 70 kg | " +
      "1×230V 50Hz oder 1×110V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c200.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => logger.info(`Sales channel link for C 200 already exists, skipping.`))

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  const c200Variants = c200.variants ?? []
  const pricePlaceholders = [
    { variantId: c200Variants[0]?.id, amount: 7999 }, // 7,999.00 EUR — Standard 150mm
    { variantId: c200Variants[1]?.id, amount: 8999 }, // 8,999.00 EUR — MAP 150mm
    { variantId: c200Variants[2]?.id, amount: 8499 }, // 8,499.00 EUR — Extended 220mm
    { variantId: c200Variants[3]?.id, amount: 9499 }, // 9,499.00 EUR — Extended + MAP
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

  logger.info("✅ C 200 seed complete!")
  logger.info(`   Region:        ${region.name}`)
  logger.info(`   Sales Channel: ${salesChannel.name}`)
  logger.info(`   Variants:      ${c200Variants.length} × C200`)
  logger.info("⚠️  Prices are placeholders — update before going live!")
}
