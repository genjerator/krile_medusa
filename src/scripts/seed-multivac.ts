import {
  ExecArgs,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedMultivac({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC product seed...")

  // ─── REGION ───────────────────────────────────────────────────────────────
  logger.info("Creating region...")
  const allRegions = await regionModule.listRegions()
  const region = allRegions[0] ?? (await regionModule.createRegions([
    {
      name: "Europe",
      currency_code: "eur",
      countries: ["de", "at", "ch", "rs", "hr", "si"],
    },
  ]))[0]

  // ─── SALES CHANNEL ────────────────────────────────────────────────────────
  logger.info("Creating sales channel...")
  const existingChannels = await salesChannelModule.listSalesChannels({ name: "Webshop" })
  const salesChannel = existingChannels[0] ?? (await salesChannelModule.createSalesChannels([
    {
      name: "Webshop",
      description: "MULTIVAC machinery webshop",
    },
  ]))[0]

  // ─── PRODUCT CATEGORY ─────────────────────────────────────────────────────
  logger.info("Creating product categories...")
  const existingParent = await productModule.listProductCategories({ handle: ["packaging-machines"] })
  const parentCategory = existingParent[0] ?? (await productModule.createProductCategories([
    {
      name: "Packaging Machines",
      handle: "packaging-machines",
      description: "Industrial and commercial vacuum packaging machines",
      is_active: true,
      is_internal: false,
    },
  ]))[0]

  const existingFloor = await productModule.listProductCategories({ handle: ["floor-chamber-machines"] })
  const floorChamberCategory = existingFloor[0] ?? (await productModule.createProductCategories([
    {
      name: "Floor Chamber Machines",
      handle: "floor-chamber-machines",
      description:
        "MULTIVAC floor chamber machines — easy to operate, clean, and maintain. " +
        "Ideal for butchers, dairies, and producers packaging larger batches.",
      parent_category_id: parentCategory.id,
      is_active: true,
      is_internal: false,
    },
  ]))[0]

  // ─── PRODUCT TAGS ─────────────────────────────────────────────────────────
  logger.info("Creating product tags...")
  const tagValues = ["vacuum-packaging", "chamber-machine", "MAP-packaging", "food-industry", "MULTIVAC", "GS-certified", "DGUV-certified", "washdown", "floor-standing"]
  const existingTags = await productModule.listProductTags({ value: tagValues })
  const existingTagValues = existingTags.map((t) => t.value)
  const newTagValues = tagValues.filter((v) => !existingTagValues.includes(v))
  const newTags = newTagValues.length > 0
    ? await productModule.createProductTags(newTagValues.map((value) => ({ value })))
    : []
  const tags = [...existingTags, ...newTags]

  const tagIds = tags.map((t) => ({ id: t.id }))

  const upsertProduct = async (data: CreateProductDTO & Record<string, any>) => {
    const { data: found } = await query.graph({
      entity: "product",
      filters: { handle: data.handle! },
      fields: ["id", "variants.*", "images.*"],
    })
    if (found[0]) {
      if (data.images?.length && (!found[0].images || found[0].images.length === 0)) {
        logger.info(`Product "${data.handle}" exists but has no images — updating.`)
        await productModule.updateProducts([{ id: found[0].id, images: data.images }])
      } else {
        logger.info(`Product "${data.handle}" already exists, skipping.`)
      }
      return found[0] as any
    }
    const [created] = await productModule.createProducts([data])
    return created
  }

  // ─── PRODUCT: C 400 ───────────────────────────────────────────────────────
  logger.info("Creating product: MULTIVAC C 400...")
  const c400 = await upsertProduct(
    {
      title: "MULTIVAC C 400 Floor Chamber Machine",
      handle: "multivac-c400-floor-chamber-machine",
      subtitle: "Configurable floor chamber vacuum packaging machine",
      images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/c400.jpg` }],
      description:
        "The MULTIVAC C 400 floor chamber machine offers the highest performance in the smallest " +
        "footprint. Thanks to a wide range of equipment options, the C 400 can be individually " +
        "configured to meet your requirements. Ideal for butchers, dairies, and other producers " +
        "who package larger batches or larger products. Equally suitable for packaging industrial " +
        "and consumer goods.\n\n" +
        "Features MULTIVAC Hygienic Design™, fully washdown-capable construction, and the " +
        "digital MC 06 control with auto-stop function and 29 product memory slots.",
      status: "published",
      category_ids: [floorChamberCategory.id],
      tags: tagIds,
      metadata: {
        brand: "MULTIVAC",
        model_family: "C-Series",
        certification: "GS, DGUV",
        control_unit: "MC 06",
        hygienic_design: true,
        washdown_capable: true,
      },
      options: [
        {
          title: "Chamber Height",
          values: ["170 mm (Standard)", "250 mm", "330 mm", "380 mm"],
        },
        {
          title: "Vacuum Pump",
          values: ["100 m³/h", "150 m³/h", "External Connection"],
        },
        {
          title: "Sealing System",
          values: [
            "Double Seam / Separating Seal (Standard)",
            "Double Seam Seal",
            "Single Seal Top and Bottom",
            "Water-Cooled Sealing Unit",
          ],
        },
      ],
      variants: [
        // Standard configuration
        {
          title: "C 400 – Standard (170mm, 100 m³/h, Double Seam/Separating)",
          sku: "MULTIVAC-C400-STD-170-100-DS",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Chamber Height": "170 mm (Standard)",
            "Vacuum Pump": "100 m³/h",
            "Sealing System": "Double Seam / Separating Seal (Standard)",
          },
          metadata: {
            chamber_depth_mm: 475,
            chamber_width_mm: 475,
            sealing_bar_front_mm: 700,
            sealing_bar_right_mm: 450,
            machine_dimensions_closed: "880 × 785 × 1035 mm",
            machine_dimensions_open: "880 × 785 × 1480 mm",
            weight_kg: 250,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: false,
            protective_gas: false,
          },
        },
        // With protective gas
        {
          title: "C 400 – MAP (170mm, 150 m³/h, + Protective Gas)",
          sku: "MULTIVAC-C400-MAP-170-150-DS",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Chamber Height": "170 mm (Standard)",
            "Vacuum Pump": "150 m³/h",
            "Sealing System": "Double Seam / Separating Seal (Standard)",
          },
          metadata: {
            chamber_depth_mm: 475,
            chamber_width_mm: 475,
            sealing_bar_front_mm: 700,
            sealing_bar_right_mm: 450,
            machine_dimensions_closed: "880 × 785 × 1035 mm",
            machine_dimensions_open: "880 × 785 × 1480 mm",
            weight_kg: 250,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: false,
            protective_gas: true,
            map_packaging: true,
          },
        },
        // Full option
        {
          title: "C 400 – Full Option (380mm, 150 m³/h, Auto Lid, MAP)",
          sku: "MULTIVAC-C400-FULL-380-150-AUTO",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Chamber Height": "380 mm",
            "Vacuum Pump": "150 m³/h",
            "Sealing System": "Water-Cooled Sealing Unit",
          },
          metadata: {
            chamber_depth_mm: 475,
            chamber_width_mm: 475,
            sealing_bar_front_mm: 700,
            sealing_bar_right_mm: 450,
            machine_dimensions_closed: "880 × 785 × 1035 mm",
            machine_dimensions_open: "880 × 785 × 1480 mm",
            weight_kg: 250,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: true,
            protective_gas: true,
            map_packaging: true,
            water_cooled_sealing: true,
          },
        },
      ],
    },
  )

  // ─── PRODUCT: C 800 ───────────────────────────────────────────────────────
  logger.info("Creating product: MULTIVAC C 800...")
  const c800 = await upsertProduct(
    {
      title: "MULTIVAC C 800 Floor Chamber Machine",
      handle: "multivac-c800-floor-chamber-machine",
      subtitle: "Extra-large floor chamber machine for long products",
      images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/c800.jpg` }],
      description:
        "The MULTIVAC C 800 was developed specifically for packaging particularly long products, " +
        "such as caliber goods for slicers, salami sticks, or whole fish. Its extra-large chamber " +
        "(1,400 × 780 mm) handles products that standard chamber machines cannot accommodate.\n\n" +
        "Features MULTIVAC Hygienic Design™, optional roller conveyors for ergonomic product " +
        "transport, MAP protective gas capability, and vacuum pumps up to 300 m³/h. " +
        "Fully washdown-capable with the proven digital MC 06 control system.",
      status: "published",
      category_ids: [floorChamberCategory.id],
      tags: tagIds,
      metadata: {
        brand: "MULTIVAC",
        model_family: "C-Series",
        certification: "GS, DGUV",
        control_unit: "MC 06",
        hygienic_design: true,
        washdown_capable: true,
        designed_for: "Long products (salami, whole fish, caliber goods for slicers)",
      },
      options: [
        {
          title: "Vacuum Pump",
          values: ["250 m³/h", "300 m³/h"],
        },
        {
          title: "Roller Conveyor",
          values: ["Without Roller Conveyor", "With Roller Conveyor"],
        },
        {
          title: "Protective Gas (MAP)",
          values: ["Without MAP", "With MAP System"],
        },
      ],
      variants: [
        // Base configuration
        {
          title: "C 800 – Standard (250 m³/h, No Roller, No MAP)",
          sku: "MULTIVAC-C800-STD-250",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Vacuum Pump": "250 m³/h",
            "Roller Conveyor": "Without Roller Conveyor",
            "Protective Gas (MAP)": "Without MAP",
          },
          metadata: {
            chamber_depth_mm: 780,
            chamber_width_mm: 1400,
            sealing_bar_length_mm: "2 × 780",
            chamber_height_mm: 170,
            machine_dimensions_closed: "1650 × 1050 × 1070 mm",
            machine_dimensions_open: "1650 × 1050 × 1670 mm",
            weight_kg: 350,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: false,
            roller_conveyor: false,
            protective_gas: false,
          },
        },
        // With roller conveyor
        {
          title: "C 800 – Ergonomic (300 m³/h, Roller Conveyor, No MAP)",
          sku: "MULTIVAC-C800-ROLLER-300",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Vacuum Pump": "300 m³/h",
            "Roller Conveyor": "With Roller Conveyor",
            "Protective Gas (MAP)": "Without MAP",
          },
          metadata: {
            chamber_depth_mm: 780,
            chamber_width_mm: 1400,
            sealing_bar_length_mm: "2 × 780",
            chamber_height_mm: 170,
            machine_dimensions_closed: "1650 × 1050 × 1070 mm",
            machine_dimensions_open: "1650 × 1050 × 1670 mm",
            weight_kg: 350,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: false,
            roller_conveyor: true,
            protective_gas: false,
          },
        },
        // Full option
        {
          title: "C 800 – Full Option (300 m³/h, Roller Conveyor, MAP, Auto Lid)",
          sku: "MULTIVAC-C800-FULL-300-MAP",
          manage_inventory: false,
          allow_backorder: true,
          options: {
            "Vacuum Pump": "300 m³/h",
            "Roller Conveyor": "With Roller Conveyor",
            "Protective Gas (MAP)": "With MAP System",
          },
          metadata: {
            chamber_depth_mm: 780,
            chamber_width_mm: 1400,
            sealing_bar_length_mm: "2 × 780",
            chamber_height_mm: 170,
            machine_dimensions_closed: "1650 × 1050 × 1070 mm",
            machine_dimensions_open: "1650 × 1050 × 1670 mm",
            weight_kg: 350,
            voltage: "3×400V 50Hz / 3×220V 60Hz",
            automatic_lid_lift: true,
            roller_conveyor: true,
            protective_gas: true,
            map_packaging: true,
          },
        },
      ],
    },
  )

  // ─── SALES CHANNEL LINKS ──────────────────────────────────────────────────
  logger.info("Linking products to sales channel...")
  for (const productId of [c400.id, c800.id]) {
    await remoteLink.create({
      [Modules.PRODUCT]: { product_id: productId },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }).catch(() => {
      logger.info(`Sales channel link for product ${productId} already exists, skipping.`)
    })
  }

  // ─── PRICE SETS ───────────────────────────────────────────────────────────
  // NOTE: Machinery prices are typically negotiated — using placeholder prices.
  // Update these with real prices before going live.
  logger.info("Creating price sets...")

  const c400Variants = c400.variants ?? []
  const c800Variants = c800.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    // C 400
    { variantId: c400Variants[0]?.id, amount: 1500000 }, // 15,000.00 EUR
    { variantId: c400Variants[1]?.id, amount: 1750000 }, // 17,500.00 EUR
    { variantId: c400Variants[2]?.id, amount: 2200000 }, // 22,000.00 EUR
    // C 800
    { variantId: c800Variants[0]?.id, amount: 2800000 }, // 28,000.00 EUR
    { variantId: c800Variants[1]?.id, amount: 3200000 }, // 32,000.00 EUR
    { variantId: c800Variants[2]?.id, amount: 3800000 }, // 38,000.00 EUR
  ]

  for (const { variantId, amount } of pricePlaceholders) {
    if (!variantId) continue

    const [priceSet] = await pricingModule.createPriceSets([
      {
        prices: [{ amount, currency_code: "eur" }],
      },
    ])

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
  logger.info(`   Categories:    ${parentCategory.name} > ${floorChamberCategory.name}`)
  logger.info(`   Products:      C 400 (${c400.id}), C 800 (${c800.id})`)
  logger.info(`   Variants:      ${c400Variants.length} × C400, ${c800Variants.length} × C800`)
  logger.info("")
  logger.info("⚠️  Prices are placeholders — update them before going live!")
  logger.info("⚠️  Add product images manually via the Medusa Admin panel.")
}