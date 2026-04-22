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
      "The MULTIVAC C 70 is an entry-level table-top chamber machine with a compact footprint, " +
      "ideal for butchers, delis, and caterers with smaller packaging volumes. " +
      "It features the high-quality MC control system with vacuum sensor, a double seam / " +
      "separating seal as standard, and a safety glass lid window.\n\n" +
      "Chamber dimensions: 305 × 310 mm, height 120 mm. " +
      "Integrated vacuum pump: 8 m³/h. " +
      "Machine dimensions (closed): 400 × 500 × 330 mm. Weight: 50 kg.",
    status: "published",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC",
      chamber_depth_mm: 305,
      chamber_width_mm: 310,
      chamber_height_mm: 120,
      vacuum_pump_m3h: 8,
      machine_dimensions_closed: "400 × 500 × 330 mm",
      machine_dimensions_open: "400 × 500 × 550 mm",
      weight_kg: 50,
      voltage: "1×230V 50Hz / 1×110V 60Hz",
      map_capable: false,
      sealing_bars: "1 × 305 mm",
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
      "Die MULTIVAC C 70 ist ein kompaktes Einstiegsmodell für die Tischkammerverpackung, " +
      "ideal für Metzger, Feinkostbetriebe und Catering mit kleineren Verpackungsmengen. " +
      "Ausgestattet mit der hochwertigen MC-Steuerung mit Vakuumsensor, " +
      "Doppelnaht-Trennsiegelung als Standardausstattung und einem Kammerdeckel " +
      "mit Sichtfenster aus Sicherheitsglas.\n\n" +
      "Kammermaße: 305 × 310 mm, Höhe 120 mm. " +
      "Integrierte Vakuumpumpe: 8 m³/h. " +
      "Maschinenmaße (bei geschlossenem Deckel): 400 × 500 × 330 mm. Gewicht: 50 kg.",
  })

  // ─── PRODUCT: C 100 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 100...")
  const c100 = await upsertProduct({
    title: "MULTIVAC C 100 Table-Top Chamber Machine",
    handle: "multivac-c100-tabletop-chamber-machine",
    subtitle: "Our most compact table-top machine with optional MAP capability",
    images: [
      { url: `${BASE}/products/tabletop/c70-c100-overview.jpg` },
      { url: `${BASE}/products/tabletop/c100-c200-c250-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 100 is our most compact table-top chamber machine that can be equipped " +
      "with a gas flushing unit (MAP). Ideal for operations that need both vacuum sealing and " +
      "modified atmosphere packaging in a minimal footprint.\n\n" +
      "Features the MC control system with vacuum sensor, double seam / separating seal as " +
      "standard, and a safety glass lid window. Optional MAP system includes a bag clamp.\n\n" +
      "Chamber dimensions: 305 × 310 mm, height 120 mm. " +
      "Integrated vacuum pump: 10 m³/h. " +
      "Machine dimensions (closed): 400 × 500 × 330 mm. Weight: 50 kg.",
    status: "published",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC",
      chamber_depth_mm: 305,
      chamber_width_mm: 310,
      chamber_height_mm: 120,
      vacuum_pump_m3h: 10,
      machine_dimensions_closed: "400 × 500 × 330 mm",
      machine_dimensions_open: "400 × 500 × 550 mm",
      weight_kg: 50,
      voltage: "1×230V 50Hz / 1×110V 60Hz",
      map_capable: true,
      sealing_bars: "1 × 305 mm",
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

  await upsertTranslation(c100.id, "de-DE", {
    title: "MULTIVAC C 100 Tischkammermaschine",
    subtitle: "Unsere kompakteste Tischkammermaschine mit optionaler Begasungseinrichtung",
    description:
      "Die MULTIVAC C 100 ist unsere kompakteste Tischkammermaschine, die mit einer " +
      "Begasungseinrichtung (MAP) ausgestattet werden kann. Ideal für Betriebe, die sowohl " +
      "Vakuumversiegelung als auch Schutzgasverpackung auf kleinstem Raum benötigen.\n\n" +
      "Ausgestattet mit der MC-Steuerung mit Vakuumsensor, Doppelnaht-Trennsiegelung als " +
      "Standardausstattung und einem Kammerdeckel mit Sichtfenster aus Sicherheitsglas. " +
      "Die optionale Begasungseinrichtung (MAP) wird inklusive Beutelklemmung geliefert.\n\n" +
      "Kammermaße: 305 × 310 mm, Höhe 120 mm. " +
      "Integrierte Vakuumpumpe: 10 m³/h. " +
      "Maschinenmaße (bei geschlossenem Deckel): 400 × 500 × 330 mm. Gewicht: 50 kg.",
  })

  // ─── PRODUCT: C 200 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 200...")
  const c200 = await upsertProduct({
    title: "MULTIVAC C 200 Table-Top Chamber Machine",
    handle: "multivac-c200-tabletop-chamber-machine",
    subtitle: "Table-top machine with an especially spacious chamber",
    images: [
      { url: `${BASE}/products/tabletop/c200-c250-overview.jpg` },
      { url: `${BASE}/products/tabletop/c100-c200-c250-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 200 is a table-top chamber machine with an especially spacious chamber " +
      "(465 × 355 mm), ideal for larger portions, whole joints, and retail-ready trays. " +
      "The chamber height can optionally be extended to 220 mm using a stainless steel lid " +
      "(without safety glass window).\n\n" +
      "Features the MC control system with vacuum sensor, double seam / separating seal as " +
      "standard, a safety glass lid window, a tilted insert as standard, and optional MAP. " +
      "A wide range of sealing variants is available.\n\n" +
      "Chamber dimensions: 465 × 355 mm, height 150 mm (opt. 220 mm). " +
      "Integrated vacuum pump: 21 m³/h. " +
      "Machine dimensions (closed): 570 × 525 × 360 mm. Weight: 70 kg.",
    status: "published",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC",
      chamber_depth_mm: 465,
      chamber_width_mm: 355,
      chamber_height_mm: 150,
      chamber_height_extended_mm: 220,
      vacuum_pump_m3h: 21,
      machine_dimensions_closed: "570 × 525 × 360 mm",
      machine_dimensions_open: "570 × 525 × 640 mm",
      weight_kg: 70,
      voltage: "1×230V 50Hz / 1×110V 60Hz",
      map_capable: true,
      sealing_bars: "1 × 465 mm",
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
        options: {
          "Chamber Height": "150 mm (Standard, Glass Lid)",
          "Protective Gas (MAP)": "Without MAP",
        },
        metadata: { chamber_height_mm: 150, map_packaging: false },
      },
      {
        title: "C 200 – With MAP (150mm)",
        sku: "MULTIVAC-C200-MAP-150",
        manage_inventory: false,
        allow_backorder: true,
        options: {
          "Chamber Height": "150 mm (Standard, Glass Lid)",
          "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)",
        },
        metadata: { chamber_height_mm: 150, map_packaging: true },
      },
      {
        title: "C 200 – Extended Chamber (220mm, No MAP)",
        sku: "MULTIVAC-C200-EXT-220",
        manage_inventory: false,
        allow_backorder: true,
        options: {
          "Chamber Height": "220 mm (Extended, Stainless Lid)",
          "Protective Gas (MAP)": "Without MAP",
        },
        metadata: { chamber_height_mm: 220, map_packaging: false, stainless_lid: true },
      },
      {
        title: "C 200 – Extended Chamber + MAP (220mm)",
        sku: "MULTIVAC-C200-EXT-220-MAP",
        manage_inventory: false,
        allow_backorder: true,
        options: {
          "Chamber Height": "220 mm (Extended, Stainless Lid)",
          "Protective Gas (MAP)": "With MAP System (incl. Bag Clamp)",
        },
        metadata: { chamber_height_mm: 220, map_packaging: true, stainless_lid: true },
      },
    ],
  })

  await upsertTranslation(c200.id, "de-DE", {
    title: "MULTIVAC C 200 Tischkammermaschine",
    subtitle: "Tischkammermaschine mit besonders geräumiger Kammer",
    description:
      "Die MULTIVAC C 200 ist eine Tischkammermaschine mit einer besonders geräumigen Kammer " +
      "(465 × 355 mm), ideal für größere Portionen, ganze Braten und Thekenfertigschalen. " +
      "Die Kammerhöhe kann optional auf 220 mm erweitert werden, indem ein Edelstahldeckel " +
      "(ohne Sichtfenster) verwendet wird.\n\n" +
      "Ausgestattet mit der MC-Steuerung mit Vakuumsensor, Doppelnaht-Trennsiegelung als " +
      "Standardausstattung, Sichtfenster aus Sicherheitsglas, Schrägeinsatz als Standard " +
      "sowie optionaler Begasungseinrichtung (MAP). " +
      "Eine breite Auswahl an Siegelvarianten ist erhältlich.\n\n" +
      "Kammermaße: 465 × 355 mm, Höhe 150 mm (opt. 220 mm). " +
      "Integrierte Vakuumpumpe: 21 m³/h. " +
      "Maschinenmaße (bei geschlossenem Deckel): 570 × 525 × 360 mm. Gewicht: 70 kg.",
  })

  // ─── PRODUCT: C 250 ───────────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 250...")
  const c250 = await upsertProduct({
    title: "MULTIVAC C 250 Table-Top Chamber Machine",
    handle: "multivac-c250-tabletop-chamber-machine",
    subtitle: "Dual sealing bar table-top machine for simultaneous multi-product packaging",
    images: [
      { url: `${BASE}/products/tabletop/c200-c250-overview.jpg` },
      { url: `${BASE}/products/tabletop/c100-c200-c250-spec.jpg` },
    ],
    description:
      "The MULTIVAC C 250 features two sealing bars (2 × 465 mm: front and rear), providing " +
      "extra flexibility — especially for simultaneously packaging multiple small products. " +
      "It is the ideal choice when throughput matters without sacrificing the compact table-top " +
      "form factor.\n\n" +
      "Features the MC control system with vacuum sensor, double seam / separating seal as " +
      "standard, a safety glass lid window, a tilted insert as standard, and optional MAP. " +
      "External vacuum pump connection is optionally available.\n\n" +
      "Chamber dimensions: 465 × 285 mm, height 150 mm. " +
      "Integrated vacuum pump: 21 m³/h. " +
      "Machine dimensions (closed): 570 × 525 × 400 mm. Weight: 75 kg.",
    status: "published",
    category_ids: [tabletopCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      control_unit: "MC",
      chamber_depth_mm: 465,
      chamber_width_mm: 285,
      chamber_height_mm: 150,
      vacuum_pump_m3h: 21,
      machine_dimensions_closed: "570 × 525 × 400 mm",
      machine_dimensions_open: "570 × 525 × 720 mm",
      weight_kg: 75,
      voltage: "1×230V 50Hz / 1×110V 60Hz",
      map_capable: true,
      sealing_bars: "2 × 465 mm (front + rear)",
      dual_sealing_bars: true,
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

  await upsertTranslation(c250.id, "de-DE", {
    title: "MULTIVAC C 250 Tischkammermaschine",
    subtitle: "Tischkammermaschine mit zwei Siegelschienen für paralleles Verpacken",
    description:
      "Die MULTIVAC C 250 verfügt über zwei Siegelschienen (2 × 465 mm: vorne und hinten), " +
      "die zusätzliche Flexibilität bieten – insbesondere beim gleichzeitigen Verpacken " +
      "mehrerer kleiner Produkte. Sie ist die ideale Wahl, wenn Durchsatz wichtig ist, " +
      "ohne auf den kompakten Tischaufstellfaktor zu verzichten.\n\n" +
      "Ausgestattet mit der MC-Steuerung mit Vakuumsensor, Doppelnaht-Trennsiegelung als " +
      "Standardausstattung, Sichtfenster aus Sicherheitsglas, Schrägeinsatz als Standard " +
      "sowie optionaler Begasungseinrichtung (MAP). " +
      "Anschluss für externe Vakuumpumpe optional erhältlich.\n\n" +
      "Kammermaße: 465 × 285 mm, Höhe 150 mm. " +
      "Integrierte Vakuumpumpe: 21 m³/h. " +
      "Maschinenmaße (bei geschlossenem Deckel): 570 × 525 × 400 mm. Gewicht: 75 kg.",
  })

  // ─── SALES CHANNEL LINKS ──────────────────────────────────────────────────
  logger.info("Linking products to sales channel...")
  for (const productId of [c70.id, c100.id, c200.id, c250.id]) {
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: productId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }).catch(() => {
      logger.info(`Sales channel link for ${productId} already exists, skipping.`)
    })
  }

  // ─── PRICE SETS ───────────────────────────────────────────────────────────
  logger.info("Creating price sets...")
  const c70Variants = c70.variants ?? []
  const c100Variants = c100.variants ?? []
  const c200Variants = c200.variants ?? []
  const c250Variants = c250.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    // C 70 — 2 variants (EU / US, same price)
    { variantId: c70Variants[0]?.id,  amount:  499900 }, // 4,999.00 EUR
    { variantId: c70Variants[1]?.id,  amount:  499900 },
    // C 100 — Standard / MAP
    { variantId: c100Variants[0]?.id, amount:  599900 }, // 5,999.00 EUR
    { variantId: c100Variants[1]?.id, amount:  699900 }, // 6,999.00 EUR
    // C 200 — Standard / MAP / Extended / Extended+MAP
    { variantId: c200Variants[0]?.id, amount:  799900 }, // 7,999.00 EUR
    { variantId: c200Variants[1]?.id, amount:  899900 }, // 8,999.00 EUR
    { variantId: c200Variants[2]?.id, amount:  849900 }, // 8,499.00 EUR
    { variantId: c200Variants[3]?.id, amount:  949900 }, // 9,499.00 EUR
    // C 250 — Standard / MAP
    { variantId: c250Variants[0]?.id, amount:  899900 }, // 8,999.00 EUR
    { variantId: c250Variants[1]?.id, amount:  999900 }, // 9,999.00 EUR
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
  logger.info(`   Products:      C 70, C 100, C 200, C 250`)
  logger.info(`   Variants:      ${c70Variants.length} × C70, ${c100Variants.length} × C100, ${c200Variants.length} × C200, ${c250Variants.length} × C250`)
  logger.info(`   Translations:  de-DE added for all 4 products`)
  logger.info("")
  logger.info("⚠️  Prices are placeholders — update them before going live!")
}
