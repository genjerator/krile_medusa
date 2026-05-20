import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedC250({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Seeding MULTIVAC C 250...")

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

  // ─── PRODUCT: C 250 ───────────────────────────────────────────────────────
  const c250 = await upsertProduct({
    title: "MULTIVAC C 250 Table-Top Chamber Machine",
    handle: "multivac-c250-tabletop-chamber-machine",
    subtitle: "Dual sealing bar table-top machine for simultaneous multi-product packaging",
    description:
      "The MULTIVAC C 250 features two sealing bars (2 × 465 mm: front and rear), providing " +
      "extra flexibility — especially for simultaneously packaging multiple small products. " +
      "It is the ideal choice when throughput matters without sacrificing the compact table-top form factor.\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, and storage for 29 product programs in 18 selectable " +
      "languages. Standard double seam / separating seal, safety glass lid window, and tilted insert. " +
      "Optional MAP gas flushing unit with bag clamp. External vacuum pump connection optionally available.\n\n" +
      "Fully washdown-capable with hygienic design. Sealing bars, insert plates and inclined inserts " +
      "are tool-free removable for cleaning. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bars 2×465 mm (front + rear) | Chamber 465×285 mm, height 150 mm | " +
      "Vacuum pump 21 m³/h | Dimensions (closed) 570×525×400 mm | Weight 75 kg | " +
      "1×230V 50Hz or 1×110V 60Hz",
    status: "published",
    weight: 75000,
    length: 525,
    width: 570,
    height: 400,
    origin_country: "de",
    material: "Stainless Steel / Safety Glass",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC 06",
      chamber_seal_length_mm: 465,
      chamber_width_mm: 285,
      chamber_height_mm: 150,
      sealing_bars: "2 × 465 mm (front + rear)",
      sealing_bar_count: 2,
      sealing_bar_position: "front + rear",
      sealing_type: "Doppelnaht-Trennsiegelung",
      dual_sealing_bars: true,
      vacuum_pump_m3h: 21,
      external_vacuum_pump: true,
      machine_dimensions_closed: "570 × 525 × 400 mm",
      machine_dimensions_open: "570 × 525 × 720 mm",
      weight_kg: 75,
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
        title: "Protective Gas (MAP)",
        values: ["Without MAP", "With MAP System (incl. Bag Clamp)"],
      },
    ],
    variants: [
      {
        title: "C 250 – Standard (No MAP)",
        sku: "MULTIVAC-C250-STD",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Protective Gas (MAP)": "Without MAP" },
        metadata: { map_packaging: false },
      },
      {
        title: "C 250 – With MAP (incl. Bag Clamp)",
        sku: "MULTIVAC-C250-MAP",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)" },
        metadata: { map_packaging: true },
      },
    ],
  })

  await upsertTranslation(c250.id, "en-US", {
    title: "MULTIVAC C 250 Table-Top Chamber Machine",
    subtitle: "Dual sealing bar table-top machine for simultaneous multi-product packaging",
    description:
      "The MULTIVAC C 250 features two sealing bars (2 × 465 mm: front and rear), providing " +
      "extra flexibility — especially for simultaneously packaging multiple small products.\n\n" +
      "Features the MC 06 digital control system with vacuum sensor, auto-stop function, " +
      "vacuum quick-stop, soft ventilation, 29 product programs, 18 languages. " +
      "Standard double seam / separating seal, safety glass lid window, tilted insert. " +
      "Optional MAP gas flushing unit with bag clamp. External vacuum pump connection optional.\n\n" +
      "Fully washdown-capable. GS-certified (DGUV).\n\n" +
      "Specifications: Sealing bars 2×465 mm (front + rear) | Chamber 465×285 mm, height 150 mm | " +
      "Vacuum pump 21 m³/h | Dimensions (closed) 570×525×400 mm | Weight 75 kg | " +
      "1×230V 50Hz or 1×110V 60Hz",
  })

  await upsertTranslation(c250.id, "de-DE", {
    title: "MULTIVAC C 250 Tischkammermaschine",
    subtitle: "Tischkammermaschine mit zwei Siegelschienen für paralleles Verpacken",
    description:
      "Die MULTIVAC C 250 verfügt über zwei Siegelschienen (2 × 465 mm: vorne und hinten), " +
      "die zusätzliche Flexibilität bieten – insbesondere beim gleichzeitigen Verpacken " +
      "mehrerer kleiner Produkte.\n\n" +
      "Ausgestattet mit der digitalen Elektroniksteuerung MC 06 mit Vakuumsensor, " +
      "Auto-Stopp-Funktion, Vakuum-Schnellstopp, sanfter Belüftung und 29 Produktspeicherplätzen " +
      "in 18 einstellbaren Bediensprachen. Doppelnaht-Trennsiegelung, Sichtfenster aus Sicherheitsglas " +
      "und Schrägeinsatz als Standard. Optionale Begasungseinrichtung (MAP) inkl. Beutelklemmung. " +
      "Anschluss für externe Vakuumpumpe optional erhältlich.\n\n" +
      "Komplett washdownfähig. GS-geprüft (DGUV).\n\n" +
      "Technische Daten: Siegelschienen 2×465 mm (vorne + hinten) | Kammer 465×285 mm, Höhe 150 mm | " +
      "Vakuumpumpe 21 m³/h | Abmessungen (geschlossen) 570×525×400 mm | Gewicht 75 kg | " +
      "1×230V 50Hz oder 1×110V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c250.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => logger.info(`Sales channel link for C 250 already exists, skipping.`))

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  const c250Variants = c250.variants ?? []
  const pricePlaceholders = [
    { variantId: c250Variants[0]?.id, amount: 8999 }, // 8,999.00 EUR — Standard
    { variantId: c250Variants[1]?.id, amount: 9999 }, // 9,999.00 EUR — With MAP
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

  logger.info("✅ C 250 seed complete!")
  logger.info(`   Region:        ${region.name}`)
  logger.info(`   Sales Channel: ${salesChannel.name}`)
  logger.info(`   Variants:      ${c250Variants.length} × C250`)
  logger.info("⚠️  Prices are placeholders — update before going live!")
}
