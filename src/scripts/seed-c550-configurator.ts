/**
 * Turns the existing MULTIVAC C 550 into a configurable product — same pattern as
 * seed-c500-configurator.ts:
 *   - Pump → the product's ONE option ("Vakuumpumpe"), one priced variant per model.
 *   - 10 optional add-ons → each its own simple product (1 variant + price), linked
 *     to the same sales channel(s) and referenced from `metadata.addon_product_ids`.
 *
 * IDEMPOTENT. Prices are only created where missing; touches only the C 550 and
 * its 10 add-ons. Pump section rebuilds variants only when the pump SKUs aren't
 * already present.
 *
 * Run:  npx medusa exec ./src/scripts/seed-c550-configurator.ts
 */
import {
  ExecArgs,
  IProductModuleService,
  IPricingModuleService,
  IRegionModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const C550_HANDLE = "multivac-c550-double-chamber-machine"
const PUMP_OPTION = "Vakuumpumpe"

// Pump models = C 550 variants. `amount` is euros as-is (35.301 € = 35301).
// Ordered by price ascending (cheapest first) — the display order.
const PUMPS = [
  { name: "Busch R5-RD 0200 A (160 m³/h)", sku: "MULTIVAC-C550-PUMP-0200A", amount: 35301 },
  { name: "Busch R5-RD 0300 A (250 m³/h)", sku: "MULTIVAC-C550-PUMP-0300A", amount: 37966 },
  { name: "Busch R5-RD 0360 A (300 m³/h)", sku: "MULTIVAC-C550-PUMP-0360A", amount: 38030 },
]

// 10 optional add-ons, in display order.
const ADDONS = [
  { handle: "c550-option-fahrbar-lenkrollen",               de: "Maschine fahrbar, auf Lenkrollen",       en: "Machine mobile, on castors",              amount: 511 },
  { handle: "c550-option-ausfuellplatte-standard",          de: "Ausfüllplatte bei Standardkammerhöhe",   en: "Filler plate at standard chamber height", amount: 530 },
  { handle: "c550-option-schraegeinsaetze-edelstahl",       de: "Satz Schrägeinsätze aus Edelstahl",      en: "Set of stainless steel inclined inserts", amount: 547 },
  { handle: "c550-option-beutelklemmung",                   de: "Beutelklemmung",                         en: "Bag clamping",                            amount: 576 },
  { handle: "c550-option-doppelnahtsiegelung-oben",         de: "Doppelnahtsiegelung oben",               en: "Double seam sealing, top",                amount: 105 },
  { handle: "c550-option-einfachsiegelung-oben",            de: "Einfachsiegelung oben",                  en: "Single sealing, top",                     amount: 105 },
  { handle: "c550-option-einfachsiegelung-oben-unten",      de: "Einfachsiegelung oben/unten",            en: "Single sealing, top/bottom",              amount: 4057 },
  { handle: "c550-option-wassergekuehlte-siegeleinrichtung", de: "Wassergekühlte Siegeleinrichtung",      en: "Water-cooled sealing device",             amount: 1285 },
  { handle: "c550-option-absaugdrossel",                    de: "Absaugdrossel",                          en: "Suction throttle",                        amount: 1056 },
  { handle: "c550-option-schutzgaseinrichtung",             de: "Schutzgaseinrichtung",                   en: "Protective gas unit",                     amount: 969 },
]

export default async function seedC550Configurator({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 C 550 configurator seed…")

  const regions = await regionModule.listRegions()
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  if (!region) throw new Error("No region found")

  const { data: found } = await query.graph({
    entity: "product",
    filters: { handle: C550_HANDLE },
    fields: ["id", "metadata", "options.id", "options.title", "variants.id", "variants.sku", "sales_channels.id"],
  })
  const c550: any = found[0]
  if (!c550) throw new Error(`C 550 not found (handle ${C550_HANDLE}). Seed the product first.`)

  const channelIds: string[] = (c550.sales_channels ?? []).map((s: any) => s.id)
  logger.info(`C 550 = ${c550.id}; sales channels = ${channelIds.join(", ") || "(none)"}`)

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
    const [priceSet] = await pricingModule.createPriceSets([{ prices: [{ amount, currency_code: "eur" }] }])
    await remoteLink.create({
      [Modules.PRODUCT]: { variant_id: variantId },
      [Modules.PRICING]: { price_set_id: priceSet.id },
    })
    logger.info(`  priced ${variantId} = ${amount} eur`)
  }

  // ─── Pump ───────────────────────────────────────────────────────────────
  const existingSkus: string[] = (c550.variants ?? []).map((v: any) => v.sku).filter(Boolean)
  const pumpSkus = PUMPS.map((p) => p.sku)
  const alreadyBuilt = pumpSkus.every((s) => existingSkus.includes(s))

  if (alreadyBuilt) {
    logger.info("Pump variants already present — ensuring prices only.")
    for (const p of PUMPS) {
      const v = (c550.variants ?? []).find((x: any) => x.sku === p.sku)
      if (v) await ensureVariantPrice(v.id, p.amount)
    }
  } else {
    logger.info("⚠️  Rebuilding C 550 variants for the Vakuumpumpe option…")
    if ((c550.variants ?? []).length) {
      await productModule.deleteProductVariants((c550.variants as any[]).map((v) => v.id))
    }
    if ((c550.options ?? []).length) {
      await productModule.deleteProductOptions((c550.options as any[]).map((o) => o.id))
    }
    await productModule.createProductOptions([
      { product_id: c550.id, title: PUMP_OPTION, values: PUMPS.map((p) => p.name) },
    ])
    const created = await productModule.createProductVariants(
      PUMPS.map((p) => ({
        product_id: c550.id,
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

  // ─── Add-ons ────────────────────────────────────────────────────────────
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
          metadata: { addon: true, hidden: true, addon_for: C550_HANDLE },
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

    for (const scId of channelIds) {
      await remoteLink
        .create({
          [Modules.PRODUCT]: { product_id: productId },
          [Modules.SALES_CHANNEL]: { sales_channel_id: scId },
        })
        .catch(() => {})
    }

    if (variantId) await ensureVariantPrice(variantId, a.amount)

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

  await productModule.updateProducts(
    { id: c550.id },
    { metadata: { ...(c550.metadata ?? {}), addon_product_ids: addonProductIds } }
  )

  logger.info(`✅ Done. C 550 pump variants set + ${addonProductIds.length} add-ons linked.`)
  logger.info(`   addon_product_ids = ${JSON.stringify(addonProductIds)}`)
}
