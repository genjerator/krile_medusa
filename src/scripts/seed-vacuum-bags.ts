import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/core-flows"
import { VACUUM_BAG_MODULE } from "../modules/vacuumBag"
import {
  OPTION_FARBE,
  OPTION_STAERKE,
  OPTION_BREITE,
  OPTION_HOEHE,
  colorOptionValue,
  thicknessOptionValue,
  widthOptionValue,
  heightOptionValue,
  skuFor,
  variantTitle,
  round2,
} from "../lib/vacuum-bag"

/**
 * Seeds the vacuum-bag configurator with SENSIBLE, MERCHANT-EDITABLE DEFAULTS:
 *   - colours (Transparent is the default; hex chips seeded, preview images left
 *     null for the merchant to upload later),
 *   - the price matrix, built from the real existing `vakuumbeutel-*` sizes/prices
 *     as the Transparent · 90 µm baseline, with other colours/thicknesses derived
 *     via clearly-editable multipliers (see COLOR_MULT / THICKNESS_MULT below),
 *   - one config row (pack size 1000, default colour Transparent),
 *   - the single hidden configurable product (handle `vakuumiertueten`) with the
 *     four options seeded with every distinct value, plus one default variant,
 *   - the product ↔ config module link.
 *
 * Idempotent: re-running only fills in what's missing. Prices are stored as-is
 * (69.00 = €69.00, never cents).
 *
 * Run: pnpm medusa exec ./src/scripts/seed-vacuum-bags.ts
 */

const PRODUCT_HANDLE = "vakuumiertueten"
const SALES_CHANNEL_NAME = "IndustriesWebshop"
const PACK_SIZE = 1000

// Preview images live in S3 under the file module's public prefix (uploaded via
// aws s3 cp with deterministic keys, so these URLs are stable).
const COLOR_IMAGE_BASE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/planeta_admin/vacuum-bag-colors"

// ─── Colours (default set — merchant edits/extends in the module) ─────────────
// Transparent stays the default + pricing baseline (no film photo). The six
// coloured films carry the hover-preview photos.
const COLORS = [
  { slug: "transparent", name: "Transparent", hex: "#e5e7eb", rank: 0, is_default: true, image_url: null as string | null },
  { slug: "blau", name: "Blau", hex: "#1d4ed8", rank: 1, is_default: false, image_url: `${COLOR_IMAGE_BASE}/blau.jpg` },
  { slug: "braun", name: "Braun", hex: "#92400e", rank: 2, is_default: false, image_url: `${COLOR_IMAGE_BASE}/braun.jpg` },
  { slug: "rot", name: "Rot", hex: "#b91c1c", rank: 3, is_default: false, image_url: `${COLOR_IMAGE_BASE}/rot.jpg` },
  { slug: "holz", name: "Holz", hex: "#b45309", rank: 4, is_default: false, image_url: `${COLOR_IMAGE_BASE}/holz.jpg` },
  { slug: "gold", name: "Gold", hex: "#ca8a04", rank: 5, is_default: false, image_url: `${COLOR_IMAGE_BASE}/gold.jpg` },
  { slug: "schwarz", name: "Schwarz", hex: "#111827", rank: 6, is_default: false, image_url: `${COLOR_IMAGE_BASE}/schwarz.jpg` },
]

// Thickness values offered (µm). 90 µm is the priced baseline.
const THICKNESSES = [90, 120, 150]

// Baseline: Transparent · 90 µm price per pack, taken from today's real products.
const BASELINE_SIZES: { width_mm: number; height_mm: number; price: number }[] = [
  { width_mm: 100, height_mm: 300, price: 66.6 },
  { width_mm: 120, height_mm: 550, price: 69.0 },
  { width_mm: 150, height_mm: 200, price: 36.0 },
  { width_mm: 150, height_mm: 300, price: 47.0 },
  { width_mm: 160, height_mm: 250, price: 45.0 },
  { width_mm: 180, height_mm: 250, price: 49.0 },
  { width_mm: 200, height_mm: 250, price: 58.0 },
  { width_mm: 200, height_mm: 300, price: 62.0 },
  { width_mm: 300, height_mm: 300, price: 85.0 },
  { width_mm: 300, height_mm: 390, price: 66.6 },
  { width_mm: 300, height_mm: 400, price: 105.0 },
  { width_mm: 400, height_mm: 500, price: 66.6 },
  { width_mm: 400, height_mm: 600, price: 66.6 },
  { width_mm: 450, height_mm: 650, price: 66.6 },
]

// Editable price multipliers relative to the Transparent · 90 µm baseline.
const COLOR_MULT: Record<string, number> = {
  transparent: 1.0,
  blau: 1.08,
  braun: 1.08,
  rot: 1.1,
  holz: 1.15,
  gold: 1.2,
  schwarz: 1.12,
}
const THICKNESS_MULT: Record<number, number> = { 90: 1.0, 120: 1.18, 150: 1.35 }

export default async function run({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const vacuumBag: any = container.resolve(VACUUM_BAG_MODULE)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  // ─── Colours (upsert by slug; authoritative set) ────────────────────────────
  // Create missing colours and UPDATE existing ones (name/hex/rank/is_default and
  // especially the preview image_url) so re-running applies the film photos even
  // if the colours were seeded earlier without them.
  const existingColors: any[] = await vacuumBag.listVacuumBagColors({})
  const bySlug = new Map<string, any>(existingColors.map((c) => [c.slug, c]))
  const desiredSlugs = new Set(COLORS.map((c) => c.slug))
  for (const c of COLORS) {
    const fields = {
      name: c.name,
      hex: c.hex,
      image_url: c.image_url,
      rank: c.rank,
      is_default: c.is_default,
      active: true,
    }
    const existing = bySlug.get(c.slug)
    if (existing) {
      await vacuumBag.updateVacuumBagColors({ id: existing.id, ...fields })
      bySlug.set(c.slug, { ...existing, ...fields })
      logger.info(`[vacuum-bags] color updated: ${c.name}`)
    } else {
      const [created] = await vacuumBag.createVacuumBagColors([{ slug: c.slug, ...fields }])
      bySlug.set(c.slug, created)
      logger.info(`[vacuum-bags] color created: ${c.name}`)
    }
  }
  // Retire any colour no longer in the set (e.g. an earlier "weiss") plus its
  // matrix rows, so the picker only offers the current colours.
  for (const ec of existingColors) {
    if (desiredSlugs.has(ec.slug) || !ec.active) continue
    await vacuumBag.updateVacuumBagColors({ id: ec.id, active: false })
    const strayPrices: any[] = await vacuumBag.listVacuumBagPrices(
      { color_id: ec.id },
      { take: 100000 }
    )
    for (const sp of strayPrices) {
      if (sp.active) await vacuumBag.updateVacuumBagPrices({ id: sp.id, active: false })
    }
    logger.info(`[vacuum-bags] color retired: ${ec.slug}`)
  }
  const defaultColor = bySlug.get(COLORS.find((c) => c.is_default)!.slug)

  // ─── Price matrix (idempotent by colour+thickness+width+height) ─────────────
  const existingPrices: any[] = await vacuumBag.listVacuumBagPrices(
    {},
    { take: 100000 }
  )
  const comboKey = (colorId: string, um: number, w: number, h: number) =>
    `${colorId}|${um}|${w}|${h}`
  const existingCombos = new Set(
    existingPrices.map((p) =>
      comboKey(p.color_id ?? p.color?.id, p.thickness_um, p.width_mm, p.height_mm)
    )
  )

  const toCreate: any[] = []
  for (const c of COLORS) {
    const color = bySlug.get(c.slug)
    const cMul = COLOR_MULT[c.slug] ?? 1
    for (const um of THICKNESSES) {
      const tMul = THICKNESS_MULT[um] ?? 1
      for (const s of BASELINE_SIZES) {
        if (existingCombos.has(comboKey(color.id, um, s.width_mm, s.height_mm))) continue
        toCreate.push({
          color_id: color.id,
          thickness_um: um,
          width_mm: s.width_mm,
          height_mm: s.height_mm,
          price: round2(s.price * cMul * tMul),
          currency_code: "eur",
          active: true,
        })
      }
    }
  }
  if (toCreate.length) {
    await vacuumBag.createVacuumBagPrices(toCreate)
    logger.info(`[vacuum-bags] price rows created: ${toCreate.length}`)
  }

  // ─── Config row (one active) ────────────────────────────────────────────────
  let [config] = await vacuumBag.listVacuumBagConfigs({ active: true })
  if (!config) {
    ;[config] = await vacuumBag.createVacuumBagConfigs([
      { pack_size: PACK_SIZE, default_color_id: defaultColor.id, active: true },
    ])
    logger.info(`[vacuum-bags] config created (pack_size=${PACK_SIZE})`)
  } else if (!config.default_color_id) {
    await vacuumBag.updateVacuumBagConfigs({
      id: config.id,
      default_color_id: defaultColor.id,
    })
  }

  // ─── Configurable product (hidden; only /vakuumiertuten-rollen fetches it) ──
  const [scs] = await Promise.all([
    salesChannelModule.listSalesChannels({ name: [SALES_CHANNEL_NAME] }),
  ])
  const salesChannelIds = scs.map((s: any) => s.id)

  const [existingProduct] = await productModule.listProducts(
    { handle: PRODUCT_HANDLE },
    { take: 1 }
  )

  // Full option-value sets, derived from the current colour/size data.
  const optionFarbe = COLORS.map((c) => colorOptionValue(c.name))
  const optionStaerke = THICKNESSES.map((t) => thicknessOptionValue(t))
  const widths = [...new Set(BASELINE_SIZES.map((s) => s.width_mm))].sort((a, b) => a - b)
  const heights = [...new Set(BASELINE_SIZES.map((s) => s.height_mm))].sort((a, b) => a - b)
  const desiredOptionValues: Record<string, string[]> = {
    [OPTION_FARBE]: optionFarbe,
    [OPTION_STAERKE]: optionStaerke,
    [OPTION_BREITE]: widths.map((w) => widthOptionValue(w)),
    [OPTION_HOEHE]: heights.map((h) => heightOptionValue(h)),
  }

  let productId: string
  if (existingProduct) {
    productId = existingProduct.id
    logger.info(`[vacuum-bags] product exists (${PRODUCT_HANDLE}), syncing option values`)

    // Additively sync the option values so newly-added colours/sizes (e.g. Braun,
    // Holz, Gold) become valid for lazily-created variants. Only adds values;
    // existing ones keep their ids, so variants are untouched.
    const [prod] = await productModule.listProducts(
      { id: productId },
      { take: 1, relations: ["options", "options.values"] }
    )
    for (const opt of prod?.options ?? []) {
      const desired = desiredOptionValues[opt.title]
      if (!desired) continue
      const current = new Set((opt.values ?? []).map((v: any) => v.value))
      const missing = desired.filter((v) => !current.has(v))
      if (missing.length) {
        await productModule
          .updateProductOptions(opt.id, { values: desired })
          .then(() =>
            logger.info(`[vacuum-bags] option "${opt.title}" +${missing.length} value(s)`)
          )
          .catch((e: any) =>
            logger.warn(`[vacuum-bags] option sync failed for "${opt.title}": ${e.message}`)
          )
      }
    }
  } else {
    // One default variant so the product is valid & the default selection resolves.
    const dSize = BASELINE_SIZES.find((s) => s.width_mm === 200 && s.height_mm === 300) ?? BASELINE_SIZES[0]
    const dUm = THICKNESSES[0]
    const dColor = COLORS.find((c) => c.is_default)!
    const dPrice = round2(dSize.price * (COLOR_MULT[dColor.slug] ?? 1) * (THICKNESS_MULT[dUm] ?? 1))

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
              { title: OPTION_FARBE, values: optionFarbe },
              { title: OPTION_STAERKE, values: optionStaerke },
              { title: OPTION_BREITE, values: widths.map((w) => widthOptionValue(w)) },
              { title: OPTION_HOEHE, values: heights.map((h) => heightOptionValue(h)) },
            ],
            variants: [
              {
                title: variantTitle(dColor.name, dUm, dSize.width_mm, dSize.height_mm, PACK_SIZE),
                sku: skuFor(dColor.slug, dUm, dSize.width_mm, dSize.height_mm),
                manage_inventory: false,
                options: {
                  [OPTION_FARBE]: colorOptionValue(dColor.name),
                  [OPTION_STAERKE]: thicknessOptionValue(dUm),
                  [OPTION_BREITE]: widthOptionValue(dSize.width_mm),
                  [OPTION_HOEHE]: heightOptionValue(dSize.height_mm),
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
    `VACUUM BAGS SEED DONE: colors=${bySlug.size} price_rows_added=${toCreate.length} product=${PRODUCT_HANDLE}`
  )
}
