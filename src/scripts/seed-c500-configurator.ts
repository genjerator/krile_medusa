/**
 * Turns the existing MULTIVAC C 500 into a configurable product:
 *   - Pump  → the product's ONE option ("Vakuumpumpe") with one variant per
 *             model (ordered by price), each carrying its own price (base price).
 *   - 13 optional add-ons → each its own simple product (1 variant + price),
 *             linked to the same sales channel(s) as the C 500 and referenced
 *             from `c500.metadata.addon_product_ids` (the storefront reads this
 *             to render the "Optionen" checkboxes).
 *
 * Design notes / safety:
 *   - IDEMPOTENT. Re-running does not change existing prices: prices are only
 *     created for variants/add-ons that don't have one yet. Nothing here touches
 *     any product other than the C 500 and the 13 add-ons it creates.
 *   - The pump section REBUILDS the C 500's variants (deletes current variants +
 *     non-pump options, then creates the Vakuumpumpe option + 3 variants) ONLY
 *     when the 3 pump SKUs are not already present. Test locally before prod.
 *
 * Run:  npx medusa exec ./src/scripts/seed-c500-configurator.ts
 */
import {
  ExecArgs,
  IProductModuleService,
  IPricingModuleService,
  IRegionModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const C500_HANDLE = "multivac-c500-double-chamber-machine"
const PUMP_OPTION = "Vakuumpumpe"

// Pump models = C 500 variants. `amount` is euros as-is (NOT cents): 25.433 € = 25433.
// Ordered by price ascending (cheapest first) — that's the display order.
const PUMPS = [
  { name: "Busch R5-RA 0100 (100 m³/h)",   sku: "MULTIVAC-C500-PUMP-0100",  amount: 23995 },
  { name: "Busch R5-RD 0200 A (160 m³/h)", sku: "MULTIVAC-C500-PUMP-0200A", amount: 25433 },
  { name: "Rietschle VCS 150 (150 m³/h)",  sku: "MULTIVAC-C500-PUMP-VCS150", amount: 26534 },
  { name: "Busch R5-RD 0300 A (250 m³/h)", sku: "MULTIVAC-C500-PUMP-0300A", amount: 28098 },
  { name: "Busch R5-RD 0360 A (300 m³/h)", sku: "MULTIVAC-C500-PUMP-0360A", amount: 28162 },
]

// 13 optional add-ons, in the order they should appear on the page.
const ADDONS = [
  { handle: "c500-option-fahrbar-lenkrollen",        de: "Maschine fahrbar, auf Lenkrollen",                     en: "Machine mobile, on castors",                          amount: 518 },
  { handle: "c500-option-kammerdeckel-250",          de: "Kammerdeckel für Kammerhöhe 250 mm",                   en: "Chamber lid for 250 mm chamber height",               amount: 1214 },
  { handle: "c500-option-sichtfenster-standard",     de: "Sichtfenster im Kammerdeckel bei Standardkammerhöhe",  en: "Viewing window in chamber lid, standard height",      amount: 1538 },
  { handle: "c500-option-ausfuellplatte-standard",   de: "Ausfüllplatte bei Standardkammerhöhe",                 en: "Filler plate at standard chamber height",             amount: 530 },
  { handle: "c500-option-ausfuellplatte-250",        de: "Ausfüllplatte bei Kammerhöhe 250 mm",                  en: "Filler plate at 250 mm chamber height",               amount: 736 },
  { handle: "c500-option-schraegeinsaetze-edelstahl", de: "Satz Schrägeinsätze aus Edelstahl",                   en: "Set of stainless steel inclined inserts",             amount: 491 },
  { handle: "c500-option-beutelklemmung",            de: "Beutelklemmung",                                       en: "Bag clamping",                                        amount: 260 },
  { handle: "c500-option-doppelnahtsiegelung-oben",  de: "Doppelnahtsiegelung oben",                             en: "Double seam sealing, top",                            amount: 110 },
  { handle: "c500-option-einfachsiegelung-oben",     de: "Einfachsiegelung oben",                                en: "Single sealing, top",                                 amount: 110 },
  { handle: "c500-option-einfachsiegelung-oben-unten", de: "Einfachsiegelung oben/unten",                        en: "Single sealing, top/bottom",                          amount: 3818 },
  { handle: "c500-option-wassergekuehlte-siegeleinrichtung", de: "Wassergekühlte Siegeleinrichtung",              en: "Water-cooled sealing device",                         amount: 1007 },
  { handle: "c500-option-absaugdrossel",             de: "Absaugdrossel",                                        en: "Suction throttle",                                    amount: 1115 },
  { handle: "c500-option-schutzgaseinrichtung",      de: "Schutzgaseinrichtung",                                 en: "Protective gas unit",                                 amount: 955 },
]

export default async function seedC500Configurator({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 C 500 configurator seed…")

  // ─── Region (eur) ───────────────────────────────────────────────────────
  const regions = await regionModule.listRegions()
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  if (!region) throw new Error("No region found")

  // ─── Resolve the existing C 500 + its sales channels ────────────────────
  const { data: found } = await query.graph({
    entity: "product",
    filters: { handle: C500_HANDLE },
    fields: [
      "id",
      "metadata",
      "options.id",
      "options.title",
      "variants.id",
      "variants.sku",
      "sales_channels.id",
    ],
  })
  const c500: any = found[0]
  if (!c500) throw new Error(`C 500 not found (handle ${C500_HANDLE}). Seed the product first.`)

  const channelIds: string[] = (c500.sales_channels ?? []).map((s: any) => s.id)
  logger.info(`C 500 = ${c500.id}; sales channels = ${channelIds.join(", ") || "(none)"}`)

  // Links a variant to a freshly-created eur price set — only when it has none.
  const ensureVariantPrice = async (variantId: string, amount: number) => {
    const { data: linked } = await query.graph({
      entity: "product_variant",
      filters: { id: variantId },
      fields: ["price_set.id"],
    }).catch(() => ({ data: [] as any[] }))
    if ((linked[0] as any)?.price_set?.id) {
      logger.info(`  price exists for ${variantId} — leaving unchanged`)
      return
    }
    const [priceSet] = await pricingModule.createPriceSets([
      { prices: [{ amount, currency_code: "eur" }] },
    ])
    await remoteLink.create({
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.PRICING]: { price_set_id: priceSet.id },
    })
    logger.info(`  priced ${variantId} = ${amount} eur`)
  }

  // ─── Pump: ensure the "Vakuumpumpe" option + 3 priced variants ──────────
  const existingSkus: string[] = (c500.variants ?? []).map((v: any) => v.sku).filter(Boolean)
  const pumpSkus = PUMPS.map((p) => p.sku)
  const alreadyBuilt = pumpSkus.every((s) => existingSkus.includes(s))

  if (alreadyBuilt) {
    logger.info("Pump variants already present — ensuring prices only.")
    for (const p of PUMPS) {
      const v = (c500.variants ?? []).find((x: any) => x.sku === p.sku)
      if (v) await ensureVariantPrice(v.id, p.amount)
    }
  } else {
    logger.info("⚠️  Rebuilding C 500 variants for the Vakuumpumpe option…")
    // Remove current variants + any non-pump options for a clean, deterministic set.
    if ((c500.variants ?? []).length) {
      await productModule.deleteProductVariants((c500.variants as any[]).map((v) => v.id))
    }
    // Delete ALL existing options (incl. an out-of-date Vakuumpumpe with fewer
    // values) and recreate the option fresh with the full current value set —
    // so adding pumps later just works.
    if ((c500.options ?? []).length) {
      await productModule.deleteProductOptions((c500.options as any[]).map((o) => o.id))
    }
    await productModule.createProductOptions([
      { product_id: c500.id, title: PUMP_OPTION, values: PUMPS.map((p) => p.name) },
    ])
    // Create the 3 pump variants + prices.
    const created = await productModule.createProductVariants(
      PUMPS.map((p) => ({
        product_id: c500.id,
        title: p.name,
        sku: p.sku,
        manage_inventory: false,
        allow_backorder: true,
        options: { [PUMP_OPTION]: p.name },
      }))
    )
    for (let i = 0; i < created.length; i++) {
      await ensureVariantPrice(created[i].id, PUMPS[i].amount)
    }
  }

  // ─── Add-ons: one simple product each ───────────────────────────────────
  const addonProductIds: string[] = []
  for (const a of ADDONS) {
    const { data: existing } = await query.graph({
      entity: "product",
      filters: { handle: a.handle },
      fields: ["id", "variants.id", "variants.sku"],
    })
    let productId: string
    let variantId: string | undefined

    if (existing[0]) {
      productId = (existing[0] as any).id
      variantId = (existing[0] as any).variants?.[0]?.id
      await productModule.updateProducts({ id: productId }, { title: a.de, status: "published" })
      logger.info(`Add-on exists: ${a.handle}`)
    } else {
      const [created] = await productModule.createProducts([
        {
          title: a.de,
          handle: a.handle,
          status: "published",
          metadata: { addon: true, hidden: true, addon_for: C500_HANDLE },
          options: [{ title: "Ausführung", values: ["Standard"] }],
          variants: [
            {
              title: a.de,
              sku: `${a.handle.toUpperCase()}`,
              manage_inventory: false,
              allow_backorder: true,
              options: { Ausführung: "Standard" },
            },
          ],
        } as any,
      ])
      productId = created.id
      variantId = (created as any).variants?.[0]?.id
      logger.info(`Created add-on: ${a.handle}`)
    }

    // Link add-on product to the same sales channel(s) as the C 500.
    for (const scId of channelIds) {
      await remoteLink
        .create({
          [Modules.PRODUCT]: { product_id: productId },
          [Modules.SALES_CHANNEL]: { sales_channel_id: scId },
        })
        .catch(() => {})
    }

    if (variantId) await ensureVariantPrice(variantId, a.amount)

    // EN translation (DE is the stored base title).
    try {
      const existingT = await translationModule.listTranslations({
        reference_id: productId,
        reference: "product",
        locale_code: "en-US",
      })
      if (existingT[0]) {
        await translationModule.updateTranslations({ id: existingT[0].id, translations: { title: a.en } })
      } else {
        await translationModule.createTranslations({
          reference_id: productId,
          reference: "product",
          locale_code: "en-US",
          translations: { title: a.en },
        })
      }
    } catch (e: any) {
      logger.warn(`translation skipped for ${a.handle}: ${e?.message}`)
    }

    addonProductIds.push(productId)
  }

  // ─── Point the C 500 at its add-ons (merge, don't clobber metadata) ─────
  await productModule.updateProducts(
    { id: c500.id },
    { metadata: { ...(c500.metadata ?? {}), addon_product_ids: addonProductIds } }
  )

  logger.info(`✅ Done. C 500 pump variants set + ${addonProductIds.length} add-ons linked.`)
  logger.info(`   addon_product_ids = ${JSON.stringify(addonProductIds)}`)
}
