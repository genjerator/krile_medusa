import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/core-flows"
import { VACUUM_BAG_MODULE } from "../modules/vacuumBag"
import {
  OPTION_FARBE,
  OPTION_TYP,
  OPTION_BREITE,
  OPTION_HOEHE,
  colorOptionValue,
  typeOptionValue,
  widthOptionValue,
  heightOptionValue,
  skuFor,
  variantTitle,
  round2,
} from "../lib/vacuum-bag"

/**
 * Seeds the vacuum-bag configurator from the REAL Niederwieser price list
 * (Siegelrandbeutel_Angebot_Planeta_17072026.pdf). The configurator dimensions
 * are Farbe → Typ → Breite → Höhe:
 *
 *  - **Farbe:** all colours are selectable but cosmetic — colour changes only the
 *    preview image + the variant/SKU, never the price. Every colour is priced
 *    like Transparent, so the matrix stores the Transparent rows only. Transparent
 *    is the default (the PDF itself has no colours; every item is transparent).
 *  - **Typ (product line):** one per PDF section (EasyVac PRO 90 / PRO 120 / BOSS
 *    geprägt / PRO SF Kochbeutel / BOSS SF Kochbeutel geprägt / MONO-PE
 *    recyclebar). Each type carries a FIXED thickness, so thickness isn't a
 *    separate control — it's baked into the type.
 *  - **Preis:** the PDF numbers are Niederwieser's offer to Planeta (cost,
 *    €/1000). The shop price = cost × MARKUP (1.65, i.e. +65 %), round2.
 *
 * Idempotent: colours/types are upserted by slug, the price matrix is rebuilt
 * from the data below, and the configurable product is recreated only if it still
 * has the old (pre-Typ) option shape. Prices are stored as-is (77.60 = €77.60).
 *
 * Run: pnpm medusa exec ./src/scripts/seed-vacuum-bags.ts
 */

const PRODUCT_HANDLE = "vakuumiertueten"
const SALES_CHANNEL_NAME = "IndustriesWebshop"
const PACK_SIZE = 1000

/** Shop price = supplier cost × this. 1.65 = +65 % markup. */
const MARKUP = 1.65

// Images live in S3 under the file module's public prefix (uploaded via aws s3 cp
// with deterministic keys, so these URLs are stable).
const S3_BASE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/planeta_admin"
const IMG_TRANSPARENT = `${S3_BASE}/vacuum-bag-colors/transparent.jpg` // smooth EasyVac PRO photo
const IMG_GEPRAEGT = `${S3_BASE}/vacuum-bag-types/gepraegt.jpg` // embossed EasyVac BOSS photo

// ─── Colours ──────────────────────────────────────────────────────────────────
// Transparent is the default. ALL colours are selectable, but colour is
// cosmetic: it changes only the preview image + the variant/SKU, NOT the price.
// The price depends only on (Typ, Breite, Höhe) — every colour is priced like
// Transparent — so the matrix holds the Transparent rows only and we never
// duplicate prices per colour.
const COLORS = [
  { slug: "transparent", name: "Transparent", hex: "#e5e7eb", rank: 0, is_default: true, active: true, image_url: IMG_TRANSPARENT as string | null },
  { slug: "blau", name: "Blau", hex: "#1d4ed8", rank: 1, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/blau.jpg` },
  { slug: "braun", name: "Braun", hex: "#92400e", rank: 2, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/braun.jpg` },
  { slug: "rot", name: "Rot", hex: "#b91c1c", rank: 3, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/rot.jpg` },
  { slug: "holz", name: "Holz", hex: "#b45309", rank: 4, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/holz.jpg` },
  { slug: "gold", name: "Gold", hex: "#ca8a04", rank: 5, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/gold.jpg` },
  { slug: "schwarz", name: "Schwarz", hex: "#111827", rank: 6, is_default: false, active: true, image_url: `${S3_BASE}/vacuum-bag-colors/schwarz.jpg` },
]

// ─── Types (product lines) + their sizes/costs from the PDF ─────────────────────
// Each row is [width_mm, height_mm, cost_per_1000]. The shop price = cost × MARKUP.
type SizeRow = [number, number, number]

const LINES: {
  slug: string
  name: string
  thickness_um: number
  description: string
  image_url: string
  rank: number
  is_default?: boolean
  rows: SizeRow[]
}[] = [
  {
    slug: "std-90",
    name: "Standard glatt 90 µm",
    thickness_um: 90,
    description: "Glatte PA/PE-Siegelrandbeutel (EasyVac PRO) für Kammer-Vakuumierer.",
    image_url: IMG_TRANSPARENT,
    rank: 0,
    is_default: true,
    rows: [
      [100, 260, 20.38], [100, 300, 23.52], [110, 250, 21.56], [120, 200, 18.81],
      [120, 400, 37.63], [120, 550, 51.74], [130, 250, 25.48], [130, 300, 30.57],
      [140, 200, 21.95], [140, 225, 24.69], [140, 250, 27.44], [140, 300, 32.92],
      [140, 350, 38.41], [140, 450, 49.39], [150, 200, 23.52], [150, 250, 29.40],
      [150, 300, 35.28], [150, 365, 42.92], [150, 400, 47.03], [160, 225, 28.22],
      [160, 250, 31.36], [160, 260, 32.61], [160, 275, 34.49], [160, 300, 37.63],
      [160, 325, 40.76], [170, 250, 33.32], [170, 280, 37.31], [170, 300, 39.98],
      [170, 350, 46.64], [170, 400, 53.31], [180, 200, 28.22], [180, 225, 31.75],
      [180, 240, 33.86], [180, 250, 35.28], [180, 275, 38.80], [180, 280, 39.51],
      [180, 300, 42.33], [180, 350, 49.39], [180, 365, 51.50], [180, 400, 56.44],
      [180, 500, 70.55], [200, 200, 31.36], [200, 250, 39.20], [200, 270, 42.33],
      [200, 275, 43.11], [200, 300, 47.03], [200, 350, 54.87], [200, 400, 62.71],
      [200, 450, 70.55], [200, 500, 78.39], [200, 600, 94.07], [220, 300, 51.74],
      [220, 320, 55.19], [225, 300, 52.91], [225, 325, 57.32], [225, 350, 61.73],
      [230, 300, 54.09], [230, 320, 57.70], [230, 350, 63.10], [250, 250, 48.99],
      [250, 300, 58.79], [250, 350, 68.59], [250, 400, 78.39], [250, 450, 88.19],
      [250, 500, 97.99], [250, 600, 117.59], [250, 650, 127.38], [250, 700, 137.18],
      [250, 800, 156.78], [300, 300, 70.55], [300, 350, 82.31], [300, 400, 94.07],
      [300, 450, 105.83], [300, 500, 117.59], [300, 550, 129.34], [300, 600, 141.10],
      [300, 700, 164.62], [300, 800, 188.14], [350, 400, 109.75], [350, 450, 123.46],
      [350, 500, 137.18], [350, 550, 150.90], [350, 600, 164.62], [350, 700, 192.06],
      [400, 400, 125.42], [400, 450, 141.10], [400, 500, 156.78], [400, 550, 172.46],
      [400, 600, 188.14], [400, 650, 203.81], [400, 700, 219.49], [450, 500, 176.38],
      [450, 550, 194.02], [450, 600, 211.65], [450, 650, 229.29], [450, 700, 246.93],
      [500, 600, 235.17], [500, 700, 274.37], [500, 800, 313.56], [500, 900, 352.76],
    ],
  },
  {
    slug: "std-120",
    name: "Standard glatt 120 µm",
    thickness_um: 120,
    description: "Stärkere glatte PA/PE-Beutel (120 µm) für schwere oder kantige Produkte.",
    image_url: IMG_TRANSPARENT,
    rank: 1,
    rows: [
      [200, 250, 50.08], [200, 300, 60.10], [200, 400, 80.13], [250, 300, 75.12],
      [250, 350, 87.64], [250, 400, 100.16], [250, 800, 200.32], [300, 400, 120.19],
      [300, 500, 150.24], [300, 600, 180.29], [350, 450, 157.75], [350, 500, 175.28],
      [350, 550, 192.81], [350, 650, 227.86], [380, 550, 209.33], [400, 500, 200.32],
      [400, 550, 220.35], [400, 600, 240.38], [400, 650, 260.42], [500, 700, 350.56],
    ],
  },
  {
    slug: "gepraegt",
    name: "Strukturiert / Geprägt 90 µm",
    thickness_um: 90,
    description: "Geprägte Beutel (Combifresh) für Balken- und Außen-Vakuumierer ohne Kammer.",
    image_url: IMG_GEPRAEGT,
    rank: 2,
    rows: [
      [100, 200, 17.94], [120, 550, 59.19], [150, 200, 26.90], [150, 250, 33.63],
      [150, 300, 40.36], [150, 400, 53.81], [150, 600, 80.71], [160, 250, 35.87],
      [160, 450, 64.57], [175, 250, 39.24], [200, 250, 44.84], [200, 300, 53.81],
      [200, 350, 62.78], [200, 400, 71.74], [200, 500, 89.68], [250, 300, 67.26],
      [250, 350, 78.47], [250, 400, 89.68], [250, 450, 100.89], [300, 400, 107.62],
      [300, 500, 134.52], [350, 450, 141.25], [350, 500, 156.94], [400, 500, 179.36],
      [400, 600, 215.23], [400, 700, 251.10], [500, 600, 269.04],
    ],
  },
  {
    slug: "koch",
    name: "Kochbeutel 90 µm",
    thickness_um: 90,
    description: "Koch- / Sous-vide-Beutel (SF 90), hitzebeständig bis 121 °C (max. 4 h), glatt.",
    image_url: IMG_TRANSPARENT,
    rank: 3,
    rows: [
      [150, 200, 79.74], [150, 300, 119.61], [170, 200, 90.37], [170, 250, 112.97],
      [170, 300, 135.56], [200, 250, 132.90], [200, 300, 159.48], [200, 600, 318.96],
      [230, 300, 183.40], [250, 350, 232.58], [250, 400, 265.80], [300, 400, 318.96],
      [300, 450, 358.83], [350, 400, 372.12], [350, 450, 418.64], [350, 500, 465.15],
      [400, 500, 531.60], [400, 600, 637.92], [400, 700, 744.24], [450, 650, 777.47],
    ],
  },
  {
    slug: "koch-gepraegt",
    name: "Kochbeutel geprägt 90 µm",
    thickness_um: 90,
    description: "Geprägte Koch- / Sous-vide-Beutel, bis 121 °C, für Balken-Vakuumierer.",
    image_url: IMG_GEPRAEGT,
    rank: 4,
    rows: [
      [150, 265, 125.37], [200, 300, 189.24], [250, 300, 236.55], [250, 350, 275.98],
      [300, 400, 378.48], [400, 600, 756.96],
    ],
  },
  {
    slug: "recyclebar",
    name: "Recyclebar MONO-PE 85 µm",
    thickness_um: 85,
    description: "Recycelbarer Mono-PE-Beutel (CombiNext) — für die Wertstoffsammlung geeignet.",
    image_url: IMG_TRANSPARENT,
    rank: 5,
    rows: [
      [150, 250, 65.33], [150, 300, 78.39], [200, 300, 104.52], [250, 350, 152.43],
      [250, 400, 174.20], [300, 400, 209.04], [350, 450, 274.37], [400, 600, 418.08],
    ],
  },
]

export default async function run({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const vacuumBag: any = container.resolve(VACUUM_BAG_MODULE)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  // ─── Colours (upsert by slug) ───────────────────────────────────────────────
  const existingColors: any[] = await vacuumBag.listVacuumBagColors({})
  const colorBySlug = new Map<string, any>(existingColors.map((c) => [c.slug, c]))
  for (const c of COLORS) {
    const fields = {
      name: c.name,
      hex: c.hex,
      image_url: c.image_url,
      rank: c.rank,
      is_default: c.is_default,
      active: c.active,
    }
    const existing = colorBySlug.get(c.slug)
    if (existing) {
      await vacuumBag.updateVacuumBagColors({ id: existing.id, ...fields })
      colorBySlug.set(c.slug, { ...existing, ...fields })
    } else {
      const [created] = await vacuumBag.createVacuumBagColors([{ slug: c.slug, ...fields }])
      colorBySlug.set(c.slug, created)
    }
  }
  const transparent = colorBySlug.get("transparent")
  logger.info(`[vacuum-bags] colors upserted: ${COLORS.length} (price colour-independent)`)

  // ─── Types (upsert by slug) ─────────────────────────────────────────────────
  const existingTypes: any[] = await vacuumBag.listVacuumBagTypes({})
  const typeBySlug = new Map<string, any>(existingTypes.map((t) => [t.slug, t]))
  for (const l of LINES) {
    const fields = {
      name: l.name,
      thickness_um: l.thickness_um,
      description: l.description,
      image_url: l.image_url,
      rank: l.rank,
      is_default: !!l.is_default,
      active: true,
    }
    const existing = typeBySlug.get(l.slug)
    if (existing) {
      await vacuumBag.updateVacuumBagTypes({ id: existing.id, ...fields })
      typeBySlug.set(l.slug, { ...existing, ...fields })
    } else {
      const [created] = await vacuumBag.createVacuumBagTypes([{ slug: l.slug, ...fields }])
      typeBySlug.set(l.slug, created)
    }
  }
  logger.info(`[vacuum-bags] types upserted: ${LINES.length}`)

  // ─── Price matrix: rebuild from the PDF data (transparent × types × sizes) ──
  const oldPrices: any[] = await vacuumBag.listVacuumBagPrices({}, { take: 100000 })
  if (oldPrices.length) {
    await vacuumBag.deleteVacuumBagPrices(oldPrices.map((p) => p.id))
    logger.info(`[vacuum-bags] cleared ${oldPrices.length} old price row(s)`)
  }
  const toCreate: any[] = []
  for (const l of LINES) {
    const type = typeBySlug.get(l.slug)
    for (const [w, h, cost] of l.rows) {
      toCreate.push({
        color_id: transparent.id,
        type_id: type.id,
        thickness_um: l.thickness_um,
        width_mm: w,
        height_mm: h,
        price: round2(cost * MARKUP),
        currency_code: "eur",
        active: true,
      })
    }
  }
  await vacuumBag.createVacuumBagPrices(toCreate)
  logger.info(`[vacuum-bags] price rows created: ${toCreate.length} (markup ×${MARKUP})`)

  // ─── Config row (one active) ────────────────────────────────────────────────
  let [config] = await vacuumBag.listVacuumBagConfigs({ active: true })
  if (!config) {
    ;[config] = await vacuumBag.createVacuumBagConfigs([
      { pack_size: PACK_SIZE, default_color_id: transparent.id, active: true },
    ])
    logger.info(`[vacuum-bags] config created (pack_size=${PACK_SIZE})`)
  } else if (config.default_color_id !== transparent.id) {
    await vacuumBag.updateVacuumBagConfigs({ id: config.id, default_color_id: transparent.id })
  }

  // ─── Configurable product (hidden; only /vakuumiertuten-rollen fetches it) ──
  const [scs] = await Promise.all([
    salesChannelModule.listSalesChannels({ name: [SALES_CHANNEL_NAME] }),
  ])
  const salesChannelIds = scs.map((s: any) => s.id)

  // Option-value sets. Farbe = Transparent only (active colour). Typ = all type
  // names. Breite/Höhe = union of every size across all types.
  const activeColorNames = COLORS.filter((c) => c.active).map((c) => colorOptionValue(c.name))
  const typeNames = LINES.map((l) => typeOptionValue(l.name))
  const allWidths = [...new Set(LINES.flatMap((l) => l.rows.map((r) => r[0])))].sort((a, b) => a - b)
  const allHeights = [...new Set(LINES.flatMap((l) => l.rows.map((r) => r[1])))].sort((a, b) => a - b)
  const desiredOptionValues: Record<string, string[]> = {
    [OPTION_FARBE]: activeColorNames,
    [OPTION_TYP]: typeNames,
    [OPTION_BREITE]: allWidths.map((w) => widthOptionValue(w)),
    [OPTION_HOEHE]: allHeights.map((h) => heightOptionValue(h)),
  }

  const [existingProduct] = await productModule.listProducts(
    { handle: PRODUCT_HANDLE },
    { take: 1, relations: ["options", "options.values"] }
  )

  // Recreate the product if it's missing OR still has the old (pre-Typ) shape.
  const hasTypOption = (existingProduct?.options ?? []).some(
    (o: any) => o.title === OPTION_TYP
  )

  let productId: string
  if (existingProduct && hasTypOption) {
    productId = existingProduct.id
    // Gentle path: additively sync option values (new sizes/types).
    for (const opt of existingProduct.options ?? []) {
      const desired = desiredOptionValues[opt.title]
      if (!desired) continue
      const current = new Set((opt.values ?? []).map((v: any) => v.value))
      const missing = desired.filter((v) => !current.has(v))
      if (missing.length) {
        await productModule
          .updateProductOptions(opt.id, { values: desired })
          .catch((e: any) =>
            logger.warn(`[vacuum-bags] option sync failed for "${opt.title}": ${e.message}`)
          )
      }
    }
    logger.info(`[vacuum-bags] product exists (${PRODUCT_HANDLE}), option values synced`)
  } else {
    // Reshape / first run: drop the old product (if any) and recreate with the
    // Farbe/Typ/Breite/Höhe options. Lazily-created placeholder variants go with
    // it; real ones are re-created on demand.
    if (existingProduct) {
      await remoteLink
        .dismiss({
          [Modules.PRODUCT]: { product_id: existingProduct.id },
          [VACUUM_BAG_MODULE]: { vacuum_bag_config_id: config.id },
        })
        .catch(() => {})
      await deleteProductsWorkflow(container).run({ input: { ids: [existingProduct.id] } })
      logger.info(`[vacuum-bags] old product removed (reshape to Typ options)`)
    }

    const dType = LINES.find((l) => l.is_default) ?? LINES[0]
    const dSize = dType.rows.find((r) => r[0] === 200 && r[1] === 300) ?? dType.rows[0]
    const dPrice = round2(dSize[2] * MARKUP)

    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Vakuumiertüten (konfigurierbar)",
            handle: PRODUCT_HANDLE,
            status: "published",
            subtitle: `Verpackungseinheit: ${PACK_SIZE} Stück`,
            // Hidden from all normal listings/search/sitemap; only the
            // configurator page fetches it by handle.
            metadata: { hidden: true, configurator: "vacuum_bag" },
            sales_channels: salesChannelIds.map((id: string) => ({ id })),
            // Intentionally NO category → never appears on category pages.
            options: [
              { title: OPTION_FARBE, values: activeColorNames },
              { title: OPTION_TYP, values: typeNames },
              { title: OPTION_BREITE, values: allWidths.map((w) => widthOptionValue(w)) },
              { title: OPTION_HOEHE, values: allHeights.map((h) => heightOptionValue(h)) },
            ],
            variants: [
              {
                title: variantTitle(transparent.name, dType.name, dSize[0], dSize[1], PACK_SIZE),
                sku: skuFor("transparent", dType.slug, dSize[0], dSize[1]),
                manage_inventory: false,
                options: {
                  [OPTION_FARBE]: colorOptionValue(transparent.name),
                  [OPTION_TYP]: typeOptionValue(dType.name),
                  [OPTION_BREITE]: widthOptionValue(dSize[0]),
                  [OPTION_HOEHE]: heightOptionValue(dSize[1]),
                },
                prices: [{ amount: dPrice, currency_code: "eur" }],
              },
            ],
          },
        ],
      },
    })
    productId = (result as any[])[0].id
    logger.info(`[vacuum-bags] product created (${PRODUCT_HANDLE})`)
  }

  // ─── Link config ↔ product ──────────────────────────────────────────────────
  await remoteLink
    .create({
      [Modules.PRODUCT]: { product_id: productId },
      [VACUUM_BAG_MODULE]: { vacuum_bag_config_id: config.id },
    })
    .catch(() => {
      logger.info(`[vacuum-bags] product↔config link already exists, skipping`)
    })

  console.log(
    `VACUUM BAGS SEED DONE: types=${LINES.length} price_rows=${toCreate.length} product=${PRODUCT_HANDLE}`
  )
}
