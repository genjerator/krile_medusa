/**
 * Turns the MULTIVAC Standmaschinen C 300 / C 300 Twin / C 350 / C 370 / C 400
 * into configurable products — same pattern as seed-c450/c500/c550-configurator.ts,
 * but data-driven over all five machines in one run:
 *   - Pump → each machine's ONE option ("Vakuumpumpe"), one priced variant per pump
 *     model offered for that machine (a real dropdown — these machines ship with a
 *     choice of pumps). The pump variant carries the base machine price.
 *   - Priced options → each its own simple add-on product (1 variant + price), linked
 *     to the machine's sales channel(s) and referenced from `metadata.addon_product_ids`.
 *     Options marked ☑ (Standardausstattung) in the price list are NOT add-ons.
 *
 * Source: Preisliste C300 – C400, gültig ab 01.10.2025. Prices are euros as printed
 * (8.610 € = 8610). Each machine only lists the pumps/options priced in ITS column.
 *
 * IDEMPOTENT. Prices only created where missing; touches only these five machines
 * and their add-ons. Pump variants rebuilt only when the pump SKUs aren't present.
 *
 * Run:  npx medusa exec ./src/scripts/seed-c300-c400-configurators.ts
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
  "kammerdeckel-sichtfenster-standard": { de: "Kammerdeckel aus Edelstahl mit Sichtfenster für Standardkammerhöhe", en: "Stainless steel chamber lid with window, standard chamber height" },
  "kammerdeckel-sichtfenster-230mm":    { de: "Kammerdeckel aus Edelstahl mit Sichtfenster für Kammerhöhe 230 mm",   en: "Stainless steel chamber lid with window, 230 mm chamber height" },
  "kammerdeckel-250mm":                 { de: "Kammerdeckel aus Edelstahl ohne Sichtfenster für Kammerhöhe 250 mm",   en: "Stainless steel chamber lid without window, 250 mm chamber height" },
  "kammerdeckel-330mm":                 { de: "Kammerdeckel aus Edelstahl ohne Sichtfenster für Kammerhöhe 330 mm",   en: "Stainless steel chamber lid without window, 330 mm chamber height" },
  "ausfuellplatte-standard":            { de: "Ausfüllplatte bei Standardkammerhöhe",  en: "Filler plate at standard chamber height" },
  "schraegeinsatz-edelstahl":           { de: "Schrägeinsatz aus Edelstahl",           en: "Stainless steel inclined insert" },
  "doppelnahtsiegelung":                { de: "Doppelnahtsiegelung",                   en: "Double seam sealing" },
  "doppelnahtsiegelung-oben-unten":     { de: "Doppelnahtsiegelung oben/unten",        en: "Double seam sealing, top/bottom" },
  "einfachsiegelung":                   { de: "Einfachsiegelung",                      en: "Single sealing" },
  "einfachsiegelung-oben-unten":        { de: "Einfachsiegelung oben/unten",           en: "Single sealing, top/bottom" },
  "wassergekuehlte-siegeleinrichtung":  { de: "Wassergekühlte Siegeleinrichtung",      en: "Water-cooled sealing device" },
  "halterung-gasflaschen":              { de: "Halterung für Gasflaschen",             en: "Gas bottle holder" },
  "absaugdrossel":                      { de: "Absaugdrossel",                         en: "Suction throttle" },
  "schutzgaseinrichtung":               { de: "Schutzgaseinrichtung",                  en: "Protective gas unit" },
  "beutelklemmung":                     { de: "Beutelklemmung",                        en: "Bag clamping" },
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
    key: "c300",
    label: "C 300",
    handle: "multivac-c300",
    pumps: [
      { name: "Busch R5-RA 0040", code: "R5RA0040", amount: 8610 },
      { name: "Busch R5-RA 0063", code: "R5RA0063", amount: 8772 },
    ],
    addons: [
      ["kammerdeckel-sichtfenster-230mm", 157],
      ["doppelnahtsiegelung", 52],
      ["doppelnahtsiegelung-oben-unten", 747],
      ["einfachsiegelung", 52],
      ["einfachsiegelung-oben-unten", 747],
      ["halterung-gasflaschen", 728],
      ["absaugdrossel", 409],
      ["schutzgaseinrichtung", 552],
    ],
  },
  {
    key: "c300twin",
    label: "C 300 Twin",
    handle: "multivac-c300twin-double-chamber-machine",
    pumps: [
      { name: "Busch R5-RA 0063", code: "R5RA0063", amount: 16152 },
      { name: "Busch R5-RA 0100", code: "R5RA0100", amount: 16992 },
      { name: "Rietschle VCS 150", code: "VCS150", amount: 19531 },
    ],
    addons: [
      ["kammerdeckel-sichtfenster-230mm", 319],
      ["doppelnahtsiegelung", 108],
      ["doppelnahtsiegelung-oben-unten", 1526],
      ["einfachsiegelung", 108],
      ["einfachsiegelung-oben-unten", 1526],
      ["halterung-gasflaschen", 728],
      ["absaugdrossel", 827],
      ["schutzgaseinrichtung", 1125],
    ],
  },
  {
    key: "c350",
    label: "C 350",
    handle: "multivac-c350",
    pumps: [
      { name: "Busch R5-RA 0040", code: "R5RA0040", amount: 10120 },
      { name: "Busch R5-RA 0063", code: "R5RA0063", amount: 10282 },
    ],
    addons: [
      ["doppelnahtsiegelung", 106],
      ["doppelnahtsiegelung-oben-unten", 872],
      ["einfachsiegelung", 106],
      ["einfachsiegelung-oben-unten", 872],
      ["halterung-gasflaschen", 802],
      ["absaugdrossel", 409],
      ["schutzgaseinrichtung", 847],
    ],
  },
  {
    key: "c370",
    label: "C 370",
    handle: "multivac-c370",
    pumps: [
      { name: "Busch R5-RA 0063", code: "R5RA0063", amount: 16527 },
      { name: "Busch R5-RA 0100", code: "R5RA0100", amount: 17367 },
      { name: "Rietschle VCS 150", code: "VCS150", amount: 19906 },
    ],
    addons: [
      ["doppelnahtsiegelung", 106],
      ["doppelnahtsiegelung-oben-unten", 872],
      ["einfachsiegelung", 106],
      ["einfachsiegelung-oben-unten", 872],
      ["halterung-gasflaschen", 728],
      ["absaugdrossel", 409],
      ["schutzgaseinrichtung", 847],
    ],
  },
  {
    key: "c400",
    label: "C 400",
    handle: "multivac-c400",
    pumps: [
      { name: "Busch R5-RA 0100", code: "R5RA0100", amount: 16481 },
      { name: "Rietschle VCS 100", code: "VCS100", amount: 17759 },
      { name: "Rietschle VCS 150", code: "VCS150", amount: 19020 },
    ],
    addons: [
      ["kammerdeckel-sichtfenster-standard", 2249],
      ["kammerdeckel-250mm", 574],
      ["kammerdeckel-330mm", 2903],
      ["ausfuellplatte-standard", 513],
      ["schraegeinsatz-edelstahl", 214],
      ["doppelnahtsiegelung", 110],
      ["einfachsiegelung", 110],
      ["einfachsiegelung-oben-unten", 1766],
      ["wassergekuehlte-siegeleinrichtung", 574],
      ["absaugdrossel", 592],
      ["schutzgaseinrichtung", 430],
      ["beutelklemmung", 486],
    ],
  },
]

export default async function seedC300toC400Configurators({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModule: IPricingModuleService = container.resolve(Modules.PRICING)
  const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
  const translationModule: any = container.resolve(Modules.TRANSLATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🚀 C 300–C 400 configurator seed…")

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

  logger.info("\n✅ Done — C 300 / C 300 Twin / C 350 / C 370 / C 400 configured.")
}
