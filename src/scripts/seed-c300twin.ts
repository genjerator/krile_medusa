import path from "path"
import fs from "fs"
import {
  ExecArgs,
  IFileModuleService,
  IProductModuleService,
  ISalesChannelModuleService,
  IPricingModuleService,
  IRegionModuleService,
  CreateProductDTO,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const STATIC_DIR = path.resolve(process.cwd(), "static")

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

function mimeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return MIME[ext] ?? "application/octet-stream"
}

export default async function seedC300Twin({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const fileModule: IFileModuleService = container.resolve(Modules.FILE)
  const translationModule = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 Starting MULTIVAC C 300 Twin seed...")

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
  const uploadCache = new Map<string, string>()

  const uploadImage = async (relativePath: string): Promise<string | null> => {
    if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)!
    const localPath = path.join(STATIC_DIR, relativePath)
    if (!fs.existsSync(localPath)) {
      logger.warn(`  Image not found locally, skipping: ${localPath}`)
      return null
    }
    const filename = path.basename(relativePath)
    const content  = fs.readFileSync(localPath).toString("base64")
    const mimeType = mimeFromFilename(filename)
    try {
      const [uploaded] = await fileModule.createFiles([{ filename, mimeType, content, access: "public" }])
      logger.info(`  Uploaded ${filename} → ${uploaded.url}`)
      uploadCache.set(relativePath, uploaded.url)
      return uploaded.url
    } catch (err: any) {
      logger.warn(`  Upload failed for ${filename}: ${err.message}`)
      return null
    }
  }

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
          images: (data as any).images,
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

  // ─── PRODUCT: C 300 Twin ──────────────────────────────────────────────────
  logger.info("Seeding MULTIVAC C 300 Twin...")

  logger.info("Uploading C 300 Twin images...")
  const imageUrls = (await Promise.all([
    uploadImage("products/double-chamber/c300twin-overview.jpg"),
    uploadImage("products/double-chamber/c300twin-spec.jpg"),
  ])).filter((u): u is string => u !== null)

  const c300twin = await upsertProduct({
    title: "MULTIVAC C 300 Twin Double Chamber Machine",
    handle: "multivac-c300twin-double-chamber-machine",
    subtitle: "Double chamber machine with separate lids and safety glass",
    images: imageUrls.map(url => ({ url })),
    description:
      "The MULTIVAC C 300 Twin is a double chamber machine with separate lids, fully constructed " +
      "from stainless steel with safety glass windows. Designed for continuous production, the two " +
      "alternating chambers allow uninterrupted packaging cycles.\n\n" +
      "Standard equipment includes double seam / separating seal with 2 × 440 mm sealing bars " +
      "(front-mounted). The inclined insert is included as standard. Vacuum pump, protective gas " +
      "unit, and suction throttle are available as optional extras.\n\n" +
      "Specifications: Sealing bars 2 × 440 mm (2 × front) | Chamber depth/width 470 mm, " +
      "height 160 mm | Dimensions (closed) 1,120 × 690 × 900 mm | " +
      "Dimensions (open) 1,120 × 690 × 1,390 mm | Weight 200 kg | " +
      "3×400V 50Hz or 3×220V 60Hz",
    status: "published",
    weight: 200000,
    length: 690,
    width: 1120,
    height: 900,
    origin_country: "de",
    material: "Stainless Steel / Safety Glass",
    category_ids: [doubleChamberCategory.id],
    tags: tagIds,
    metadata: {
      brand: "MULTIVAC",
      model_family: "C-Series",
      sealing_bars: "2 × 440 mm",

      // ─── Ausstattung ──────────────────────────────────────────────
      "ausstattung__laenge_siegelschiene_mm": "2 × 440",
      "ausstattung__kammertiefe_breite_mm": 470,
      "ausstattung__anzahl_siegelschienen": "2 × vorne",
      "ausstattung__kammerhoehe_mm": 160,
      "ausstattung__sichtfenster_sicherheitsglas": true,
      "ausstattung__vakuumpumpe_m3h": "optional: 63 / 100 / 150",
      "ausstattung__anschluss_externe_vakuumpumpe": "optional",
      "ausstattung__maschinenmasze_geschlossen_mm": "1.120 × 690 × 900",
      "ausstattung__maschinenmasze_geoeffnet_mm": "1.120 × 690 × 1.390",
      "ausstattung__gewicht_kg": 200,
      "ausstattung__absaugdrossel": "optional",
      "ausstattung__schutzgaseinrichtung": "optional",

      // ─── Siegelvarianten ──────────────────────────────────────────
      "siegelvarianten__doppelnaht_trennsiegelung": true,
      "siegelvarianten__doppelnaht_siegelung": "optional",
      "siegelvarianten__einfachsiegelung": false,
      "siegelvarianten__einfachsiegelung_oben_unten": "optional",
      "siegelvarianten__doppelnaht_siegelung_oben_unten": "optional",
      "siegelvarianten__wassergekühlte_siegeleinrichtung": "optional",
      "siegelvarianten__spannung": "3×400V, 50Hz / 3×220V, 60Hz",

      // ─── Zubehör ──────────────────────────────────────────────────
      "zubehoer__schraeg_einsatz": true,
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
        title: "C 300 Twin – Standard (400V EU)",
        sku: "MULTIVAC-C300TWIN-STD-EU",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×400V 50Hz (EU)" },
      },
      {
        title: "C 300 Twin – Standard (220V US)",
        sku: "MULTIVAC-C300TWIN-STD-US",
        manage_inventory: false,
        allow_backorder: true,
        options: { "Voltage": "3×220V 60Hz (US)" },
      },
    ],
  })

  await upsertTranslation(c300twin.id, "de-DE", {
    title: "MULTIVAC C 300 Twin Doppelkammermaschine",
    subtitle: "Doppelkammermaschine mit separaten Deckeln und Sicherheitsglas",
    description:
      "Die MULTIVAC C 300 Twin ist eine Doppelkammermaschine mit separaten Deckeln, vollständig " +
      "aus Edelstahl gefertigt und mit Sichtfenstern aus Sicherheitsglas ausgestattet. Durch die " +
      "zwei abwechselnd arbeitenden Kammern ermöglicht die Maschine unterbrechungsfreie " +
      "Verpackungszyklen für eine kontinuierliche Produktion.\n\n" +
      "Zur Standardausstattung gehören Doppelnaht-Trennsiegelung mit 2 × 440 mm Siegelschienen " +
      "(vorne) sowie ein Schrägeinsatz. Vakuumpumpe, Schutzgaseinrichtung und Absaugdrossel " +
      "sind als Optionen erhältlich.\n\n" +
      "Technische Daten: Siegelschienen 2 × 440 mm (2 × vorne) | Kammertiefe/-breite 470 mm, " +
      "Höhe 160 mm | Abmessungen (geschlossen) 1.120 × 690 × 900 mm | " +
      "Abmessungen (geöffnet) 1.120 × 690 × 1.390 mm | Gewicht 200 kg | " +
      "3×400V 50Hz oder 3×220V 60Hz",
  })

  // ─── SALES CHANNEL LINK ───────────────────────────────────────────────────
  logger.info("Linking C 300 Twin to sales channel...")
  await remoteLink.create({
    [Modules.PRODUCT]: { product_id: c300twin.id },
    [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
  }).catch(() => {
    logger.info(`Sales channel link for C 300 Twin already exists, skipping.`)
  })

  // ─── PRICE SET ────────────────────────────────────────────────────────────
  logger.info("Creating price set for C 300 Twin...")
  const c300twinVariants = c300twin.variants ?? []

  const pricePlaceholders: { variantId: string; amount: number }[] = [
    { variantId: c300twinVariants[0]?.id, amount: 15000 }, // 15,000.00 EUR — EU
    { variantId: c300twinVariants[1]?.id, amount: 15000 }, // 15,000.00 EUR — US
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
  logger.info(`   Products:      C 300 Twin`)
  logger.info(`   Variants:      ${c300twinVariants.length} × C300Twin`)
  logger.info(`   Translations:  de-DE added`)
  logger.info("")
  logger.info("⚠️  Price is a placeholder — update before going live!")
}
