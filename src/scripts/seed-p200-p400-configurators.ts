/**
 * Turns the MULTIVAC Baseline Standmaschinen P 200 / P 300 / P 400 into configurable
 * products — same pattern as the C-series configurator seeders, data-driven over all
 * three machines in one run:
 *   - Pump → each machine's ONE option ("Vakuumpumpe"), one priced variant per pump
 *     model offered for that machine. The pump variant carries the base machine price.
 *   - Priced options / accessories → each its own simple add-on product (1 variant +
 *     price), linked to the machine's sales channel(s) and referenced from
 *     `metadata.addon_product_ids`. ☑ (Standardausstattung) rows are NOT add-ons.
 *
 * Source: Preisliste P200 – P400 (Baseline), gültig ab 01.10.2025. Prices are euros
 * as printed (2.845 € = 2845). Each machine only lists the pumps/options priced in
 * ITS column. Pumps without a price in the list (MRP 005, Busch R5-PB 0004) are
 * omitted. P 400 has no Fahrgestell accessory (blank column).
 *
 * IDEMPOTENT. Prices only created where missing; touches only these three machines
 * and their add-ons. Pump variants rebuilt only when the pump SKUs aren't present.
 *
 * Run:  npx medusa exec ./src/scripts/seed-p200-p400-configurators.ts
 */
import {
  ExecArgs,
  IProductModuleService,
  IPricingModuleService,
  IRegionModuleService,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const PUMP_OPTION = "Vakuumpumpe"

// Shared add-on catalog (DE label + EN translation), keyed by slug.
const ADDON_CATALOG: Record<string, { de: string; en: string }> = {
  "schutzgaseinrichtung":               { de: "Schutzgaseinrichtung",                        en: "Protective gas unit" },
  "fahrgestell-edelstahl-ms200":        { de: "Fahrgestell aus Edelstahl (MS200)",           en: "Stainless steel undercarriage (MS200)" },
  "fahrgestell-edelstahl-ms200-bausatz":{ de: "Fahrgestell aus Edelstahl (MS200) – Bausatz", en: "Stainless steel undercarriage (MS200) – assembly kit" },
}

type Pump = { name: string; code: string; amount: number }
type Machine = {
  key: string
  label: string
  handle: string
  pumps: Pump[]                    // display order = price ascending
  addons: [slug: string, amount: number][]
}

const MACHINES: Machine[] = [
  {
    key: "p200",
    label: "P 200",
    handle: "multivac-baseline-p200",
    pumps: [
      { name: "MULTIVAC MRP 010", code: "MRP010", amount: 2845 },
      { name: "MULTIVAC Busch R5-PB 0008", code: "R5PB0008", amount: 2873 },
    ],
    addons: [
      ["schutzgaseinrichtung", 378],
      ["fahrgestell-edelstahl-ms200", 1540],
      ["fahrgestell-edelstahl-ms200-bausatz", 1133],
    ],
  },
  {
    key: "p300",
    label: "P 300",
    handle: "multivac-baseline-p300",
    pumps: [
      { name: "MULTIVAC MRP 025", code: "MRP025", amount: 3191 },
      { name: "MULTIVAC Busch R5-PB 0021", code: "R5PB0021", amount: 3318 },
    ],
    addons: [
      ["schutzgaseinrichtung", 636],
      ["fahrgestell-edelstahl-ms200", 1540],
      ["fahrgestell-edelstahl-ms200-bausatz", 1133],
    ],
  },
  {
    key: "p400",
    label: "P 400",
    handle: "multivac-baseline-p400",
    pumps: [
      { name: "MULTIVAC Busch R5-RA 0040", code: "R5RA0040", amount: 6868 },
      { name: "MULTIVAC MRP 100", code: "MRP100", amount: 6900 },
    ],
    addons: [
      ["schutzgaseinrichtung", 641],
    ],
  },
]

export default async function seedP200toP400Configurators({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 P 200–P 400 configurator seed…")

  const regions = await regionModule.listRegions()
  const region = regions.find((r) => r.currency_code === "eur") ?? regions[0]
  if (!region) throw new Error("No region found")

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

  for (const m of MACHINES) {
    logger.info(`\n── ${m.label} (${m.handle}) ──`)

    const { data: found } = await query.graph({
      entity: "product",
      filters: { handle: m.handle },
      fields: ["id", "metadata", "options.id", "options.title", "variants.id", "variants.sku", "sales_channels.id"],
    })
    const product: any = found[0]
    if (!product) {
      logger.warn(`  ⚠️  ${m.label} not found (handle ${m.handle}) — skipping. Seed the product first.`)
      continue
    }

    const channelIds: string[] = (product.sales_channels ?? []).map((s: any) => s.id)
    logger.info(`  ${m.label} = ${product.id}; sales channels = ${channelIds.join(", ") || "(none)"}`)

    // ─── Pump ───────────────────────────────────────────────────────────────
    const pumpSku = (p: Pump) => `MULTIVAC-${m.key.toUpperCase()}-PUMP-${p.code}`
    const existingSkus: string[] = (product.variants ?? []).map((v: any) => v.sku).filter(Boolean)
    const alreadyBuilt = m.pumps.every((p) => existingSkus.includes(pumpSku(p)))

    if (alreadyBuilt) {
      logger.info("  Pump variants already present — ensuring prices only.")
      for (const p of m.pumps) {
        const v = (product.variants ?? []).find((x: any) => x.sku === pumpSku(p))
        if (v) await ensureVariantPrice(v.id, p.amount)
      }
    } else {
      logger.info("  ⚠️  Rebuilding variants for the Vakuumpumpe option…")
      if ((product.variants ?? []).length) {
        await productModule.deleteProductVariants((product.variants as any[]).map((v) => v.id))
      }
      if ((product.options ?? []).length) {
        await productModule.deleteProductOptions((product.options as any[]).map((o) => o.id))
      }
      await productModule.createProductOptions([
        { product_id: product.id, title: PUMP_OPTION, values: m.pumps.map((p) => p.name) },
      ])
      const created = await productModule.createProductVariants(
        m.pumps.map((p) => ({
          product_id: product.id,
          title: p.name,
          sku: pumpSku(p),
          manage_inventory: false,
          allow_backorder: true,
          options: { [PUMP_OPTION]: p.name },
        }))
      )
      for (let i = 0; i < created.length; i++) {
        await ensureVariantPrice(created[i].id, m.pumps[i].amount)
      }
    }

    // ─── Add-ons ──────────────────────────────────────────────────────────
    const addonProductIds: string[] = []
    for (const [slug, amount] of m.addons) {
      const meta = ADDON_CATALOG[slug]
      if (!meta) {
        logger.warn(`  unknown add-on slug "${slug}" — skipping`)
        continue
      }
      const handle = `${m.key}-option-${slug}`

      const { data: existing } = await query.graph({
        entity: "product",
        filters: { handle },
        fields: ["id", "variants.id", "variants.sku"],
      })
      let productId: string
      let variantId: string | undefined

      if (existing[0]) {
        productId = (existing[0] as any).id
        variantId = (existing[0] as any).variants?.[0]?.id
        await productModule.updateProducts({ id: productId }, { title: meta.de, status: "published" })
        logger.info(`  Add-on exists: ${handle}`)
      } else {
        const [createdProd] = await productModule.createProducts([
          {
            title: meta.de,
            handle,
            status: "published",
            metadata: { addon: true, hidden: true, addon_for: m.handle },
            options: [{ title: "Ausführung", values: ["Standard"] }],
            variants: [
              {
                title: meta.de,
                sku: handle.toUpperCase(),
                manage_inventory: false,
                allow_backorder: true,
                options: { Ausführung: "Standard" },
              },
            ],
          } as any,
        ])
        productId = createdProd.id
        variantId = (createdProd as any).variants?.[0]?.id
        logger.info(`  Created add-on: ${handle}`)
      }

      for (const scId of channelIds) {
        await remoteLink
          .create({
            [Modules.PRODUCT]: { product_id: productId },
            [Modules.SALES_CHANNEL]: { sales_channel_id: scId },
          })
          .catch(() => {})
      }

      if (variantId) await ensureVariantPrice(variantId, amount)

      try {
        const existingT = await translationModule.listTranslations({
          reference_id: productId,
          reference: "product",
          locale_code: "en-US",
        })
        if (existingT[0]) {
          await translationModule.updateTranslations({ id: existingT[0].id, translations: { title: meta.en } })
        } else {
          await translationModule.createTranslations({
            reference_id: productId,
            reference: "product",
            locale_code: "en-US",
            translations: { title: meta.en },
          })
        }
      } catch (e: any) {
        logger.warn(`  translation skipped for ${handle}: ${e?.message}`)
      }

      addonProductIds.push(productId)
    }

    await productModule.updateProducts(
      { id: product.id },
      { metadata: { ...(product.metadata ?? {}), addon_product_ids: addonProductIds } }
    )

    logger.info(`  ✅ ${m.label}: ${m.pumps.length} pump variant(s) + ${addonProductIds.length} add-ons linked.`)
  }

  logger.info("\n✅ Done — P 200 / P 300 / P 400 configured.")
}
