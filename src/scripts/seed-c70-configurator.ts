/**
 * Turns the existing MULTIVAC C 70 into a configurable product — same pattern as
 * seed-c450/c500/c550-configurator.ts:
 *   - Pump → the product's ONE option ("Vakuumpumpe"), one priced variant per model.
 *     The C 70 ships with a single pump (MULTIVAC MRP 010), so there is exactly one
 *     variant and the storefront has no real dropdown to show.
 *   - 2 optional add-ons → each its own simple product (1 variant + price), linked
 *     to the same sales channel(s) and referenced from `metadata.addon_product_ids`.
 *
 * IDEMPOTENT. Prices only created where missing; touches only the C 70 and its
 * 2 add-ons. Pump section rebuilds variants only when the pump SKUs aren't present.
 *
 * Run:  npx medusa exec ./src/scripts/seed-c70-configurator.ts
 */
import {
  ExecArgs,
  IProductModuleService,
  IPricingModuleService,
  IRegionModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const C70_HANDLE = "multivac-c70-tabletop-chamber-machine"
const PUMP_OPTION = "Vakuumpumpe"

// Pump models = C 70 variants. `amount` is euros as-is (3.855 € = 3855).
// The C 70 has a single pump, so there is only one variant (no dropdown).
const PUMPS = [
  { name: "MULTIVAC MRP 010", sku: "MULTIVAC-C70-PUMP-MRP010", amount: 3855 },
]

// 2 optional add-ons, in display order.
const ADDONS = [
  { handle: "c70-option-fahrgestell-edelstahl-ms200",         de: "Fahrgestell aus Edelstahl (MS200)",            en: "Stainless steel undercarriage (MS200)",            amount: 1540 },
  { handle: "c70-option-fahrgestell-edelstahl-ms200-bausatz", de: "Fahrgestell aus Edelstahl (MS200) – Bausatz",  en: "Stainless steel undercarriage (MS200) – assembly kit", amount: 1133 },
]

export default async function seedC70Configurator({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 C 70 configurator seed…")

  const regions = await regionModule.listRegions()
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  if (!region) throw new Error("No region found")

  const { data: found } = await query.graph({
    entity: "product",
    filters: { handle: C70_HANDLE },
    fields: ["id", "metadata", "options.id", "options.title", "variants.id", "variants.sku", "sales_channels.id"],
  })
  const c70: any = found[0]
  if (!c70) throw new Error(`C 70 not found (handle ${C70_HANDLE}). Seed the product first.`)

  const channelIds: string[] = (c70.sales_channels ?? []).map((s: any) => s.id)
  logger.info(`C 70 = ${c70.id}; sales channels = ${channelIds.join(", ") || "(none)"}`)

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
  const existingSkus: string[] = (c70.variants ?? []).map((v: any) => v.sku).filter(Boolean)
  const pumpSkus = PUMPS.map((p) => p.sku)
  const alreadyBuilt = pumpSkus.every((s) => existingSkus.includes(s))

  if (alreadyBuilt) {
    logger.info("Pump variants already present — ensuring prices only.")
    for (const p of PUMPS) {
      const v = (c70.variants ?? []).find((x: any) => x.sku === p.sku)
      if (v) await ensureVariantPrice(v.id, p.amount)
    }
  } else {
    logger.info("⚠️  Rebuilding C 70 variants for the Vakuumpumpe option…")
    if ((c70.variants ?? []).length) {
      await productModule.deleteProductVariants((c70.variants as any[]).map((v) => v.id))
    }
    if ((c70.options ?? []).length) {
      await productModule.deleteProductOptions((c70.options as any[]).map((o) => o.id))
    }
    await productModule.createProductOptions([
      { product_id: c70.id, title: PUMP_OPTION, values: PUMPS.map((p) => p.name) },
    ])
    const created = await productModule.createProductVariants(
      PUMPS.map((p) => ({
        product_id: c70.id,
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
          metadata: { addon: true, hidden: true, addon_for: C70_HANDLE },
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
    { id: c70.id },
    { metadata: { ...(c70.metadata ?? {}), addon_product_ids: addonProductIds } }
  )

  logger.info(`✅ Done. C 70 pump variant set + ${addonProductIds.length} add-ons linked.`)
  logger.info(`   addon_product_ids = ${JSON.stringify(addonProductIds)}`)
}
