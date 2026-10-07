/**
 * Turns the MULTIVAC Baseline Doppelkammermaschinen P 500 / P 600 / P 605 / P 650 /
 * P 700 into configurable products — same pattern as the other configurator seeders,
 * data-driven over all five machines in one run:
 *   - Pump → each machine's ONE option ("Vakuumpumpe"), one priced variant per pump
 *     model offered for that machine (a real dropdown). The pump variant carries the
 *     base machine price.
 *   - Priced options → each its own simple add-on product (1 variant + price), linked
 *     to the machine's sales channel(s) and referenced from `metadata.addon_product_ids`.
 *     ☑ (Standardausstattung) rows are NOT add-ons.
 *
 * Source: Preisliste P500 – P700 (Baseline Doppelkammermaschinen), gültig ab
 * 01.10.2025. Prices are euros as printed (17.435 € = 17435). Each machine only lists
 * the pumps/options priced in ITS column.
 *
 * IDEMPOTENT. Prices only created where missing; touches only these five machines
 * and their add-ons. Pump variants rebuilt only when the pump SKUs aren't present.
 *
 * Run:  npx medusa exec ./src/scripts/seed-p500-p700-configurators.ts
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
  "maschine-fahrbar-lenkrollen":   { de: "Maschine fahrbar auf Lenkrollen", en: "Mobile on castors" },
  "beutelklemmung":                { de: "Beutelklemmung",                  en: "Bag clamping" },
  "doppelnahtsiegelung-oben":      { de: "Doppelnahtsiegelung oben",        en: "Double seam sealing, top" },
  "einfachsiegelung-oben":         { de: "Einfachsiegelung oben",           en: "Single sealing, top" },
  "einfachsiegelung-oben-unten":   { de: "Einfachsiegelung oben/unten",     en: "Single sealing, top/bottom" },
  "schutzgaseinrichtung":          { de: "Schutzgaseinrichtung",            en: "Protective gas unit" },
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
    key: "p500",
    label: "P 500",
    handle: "baseline-p-500",
    pumps: [
      { name: "MULTIVAC MRP 100 (60 m³/h)", code: "MRP100", amount: 17435 },
      { name: "Busch R5-RA 0063 (63 m³/h)", code: "R5RA0063", amount: 17582 },
      { name: "MULTIVAC MRP 150 (106 m³/h)", code: "MRP150", amount: 18232 },
      { name: "Busch R5-RA 0100 (100 m³/h)", code: "R5RA0100", amount: 18505 },
      { name: "MULTIVAC MRP 200 (151 m³/h)", code: "MRP200", amount: 19305 },
    ],
    addons: [
      ["maschine-fahrbar-lenkrollen", 573],
      ["beutelklemmung", 548],
      ["doppelnahtsiegelung-oben", 116],
      ["einfachsiegelung-oben", 116],
      ["einfachsiegelung-oben-unten", 3844],
      ["schutzgaseinrichtung", 968],
    ],
  },
  {
    key: "p600",
    label: "P 600",
    handle: "baseline-p-600",
    pumps: [
      { name: "MULTIVAC MRP 100 (60 m³/h)", code: "MRP100", amount: 17897 },
      { name: "Busch R5-RA 0063 (63 m³/h)", code: "R5RA0063", amount: 18044 },
      { name: "MULTIVAC MRP 150 (106 m³/h)", code: "MRP150", amount: 18694 },
      { name: "Busch R5-RA 0100 (100 m³/h)", code: "R5RA0100", amount: 18967 },
      { name: "MULTIVAC MRP 200 (151 m³/h)", code: "MRP200", amount: 19767 },
    ],
    addons: [
      ["maschine-fahrbar-lenkrollen", 573],
      ["beutelklemmung", 548],
      ["doppelnahtsiegelung-oben", 116],
      ["einfachsiegelung-oben", 116],
      ["einfachsiegelung-oben-unten", 3844],
      ["schutzgaseinrichtung", 968],
    ],
  },
  {
    key: "p605",
    label: "P 605",
    handle: "baseline-p-605",
    pumps: [
      { name: "MULTIVAC MRP 150 (106 m³/h)", code: "MRP150", amount: 22679 },
      { name: "Busch R5-RA 0100 (100 m³/h)", code: "R5RA0100", amount: 22952 },
      { name: "MULTIVAC MRP 200 (151 m³/h)", code: "MRP200", amount: 23752 },
      { name: "Busch R5-RD 0200 A (160 m³/h)", code: "R5RD0200A", amount: 24534 },
      { name: "MULTIVAC MRP 250HV (205 m³/h)", code: "MRP250HV", amount: 24984 },
      { name: "MULTIVAC MRP 400HV (305 m³/h)", code: "MRP400HV", amount: 26316 },
      { name: "Busch R5-RD 0300 A (250 m³/h)", code: "R5RD0300A", amount: 27465 },
      { name: "Busch R5-RD 0360 A (300 m³/h)", code: "R5RD0360A", amount: 27536 },
    ],
    addons: [
      ["maschine-fahrbar-lenkrollen", 573],
      ["beutelklemmung", 548],
      ["doppelnahtsiegelung-oben", 116],
      ["einfachsiegelung-oben", 116],
      ["einfachsiegelung-oben-unten", 3844],
      ["schutzgaseinrichtung", 968],
    ],
  },
  {
    key: "p650",
    label: "P 650",
    handle: "baseline-p-650",
    pumps: [
      { name: "Busch R5-RD 0200 A (160 m³/h)", code: "R5RD0200A", amount: 29705 },
      { name: "MULTIVAC MRP 250HV (205 m³/h)", code: "MRP250HV", amount: 30155 },
      { name: "MULTIVAC MRP 400HV (305 m³/h)", code: "MRP400HV", amount: 31487 },
      { name: "Busch R5-RD 0300 A (250 m³/h)", code: "R5RD0300A", amount: 32636 },
      { name: "Busch R5-RD 0360 A (300 m³/h)", code: "R5RD0360A", amount: 32707 },
    ],
    addons: [
      ["maschine-fahrbar-lenkrollen", 573],
      ["beutelklemmung", 646],
      ["doppelnahtsiegelung-oben", 116],
      ["einfachsiegelung-oben", 116],
      ["einfachsiegelung-oben-unten", 4420],
      ["schutzgaseinrichtung", 1058],
    ],
  },
  {
    key: "p700",
    label: "P 700",
    handle: "baseline-p-700",
    pumps: [
      { name: "Busch R5-RD 0200 A (160 m³/h)", code: "R5RD0200A", amount: 35244 },
      { name: "MULTIVAC MRP 250HV (205 m³/h)", code: "MRP250HV", amount: 35694 },
      { name: "MULTIVAC MRP 400HV (305 m³/h)", code: "MRP400HV", amount: 37026 },
      { name: "Busch R5-RD 0300 A (250 m³/h)", code: "R5RD0300A", amount: 38175 },
      { name: "Busch R5-RD 0360 A (300 m³/h)", code: "R5RD0360A", amount: 38246 },
    ],
    addons: [
      ["maschine-fahrbar-lenkrollen", 573],
      ["beutelklemmung", 646],
      ["doppelnahtsiegelung-oben", 116],
      ["einfachsiegelung-oben", 116],
      ["einfachsiegelung-oben-unten", 4420],
      ["schutzgaseinrichtung", 1058],
    ],
  },
]

export default async function seedP500toP700Configurators({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 P 500–P 700 configurator seed…")

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

  logger.info("\n✅ Done — P 500 / P 600 / P 605 / P 650 / P 700 configured.")
}
