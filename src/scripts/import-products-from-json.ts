import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/core-flows"
import * as fs from "fs"
import * as path from "path"

/**
 * Generic product importer: reads a JSON file describing products and creates
 * them. Environment-portable — categories and sales channels are referenced by
 * NAME and resolved to ids at runtime, so the same JSON works on local and prod.
 * Idempotent — products whose handle already exists are skipped, so re-running
 * is safe.
 *
 * JSON shape:
 *   {
 *     "defaults": {
 *       "status": "published",
 *       "currency_code": "eur",
 *       "subtitle": "...",
 *       "category_names": ["Siegelrandbeutel"],
 *       "sales_channel_names": ["IndustriesWebshop"],
 *       "option": { "title": "Menge", "value": "1000 Stück" }
 *     },
 *     "products": [
 *       { "title": "...", "handle": "...", "price": 9.9, "images": ["https://..."] }
 *     ]
 *   }
 *
 * Run (default file):  pnpm medusa exec ./src/scripts/import-products-from-json.js
 * Run (custom file):   pnpm medusa exec ./src/scripts/import-products-from-json.js /abs/path/products.json
 */
// Co-located data file, resolved via __dirname like the seeders — so it is found
// both locally and inside the deployed container (process.cwd() is unreliable there).
const DEFAULT_JSON = path.join(__dirname, "imports", "vakuumbeutel-products.json")

export default async function run({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  // Product JSON `translations` keys → locale codes used in the translation
  // table (existing convention: English = en-US, Italian = it-IT).
  const LOCALE_MAP: Record<string, string> = { de: "de-DE", en: "en-US", it: "it-IT" }

  // Ensure the target locales exist before writing translations.
  const existingLocaleCodes = (await translationModule.listLocales()).map((l: any) => l.code)
  for (const loc of [
    { code: "de-DE", name: "Deutsch" },
    { code: "en-US", name: "English" },
    { code: "it-IT", name: "Italiano" },
  ]) {
    if (!existingLocaleCodes.includes(loc.code)) await translationModule.createLocales([loc])
  }

  // Upsert a product translation row (idempotent by reference + locale).
  const upsertTranslation = async (
    reference_id: string,
    locale_code: string,
    translations: Record<string, string>
  ) => {
    const [existing] = await translationModule.listTranslations({
      reference_id,
      reference: "product",
      locale_code,
    })
    if (existing) await translationModule.updateTranslations({ id: existing.id, translations })
    else
      await translationModule.createTranslations({
        reference_id,
        reference: "product",
        locale_code,
        translations,
      })
  }

  const jsonPath = args?.[0] || DEFAULT_JSON
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`JSON file not found: ${jsonPath}`)
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"))
  const d = data.defaults ?? {}

  // Resolve category + sales-channel names → ids for THIS environment.
  const catNames: string[] = d.category_names ?? []
  const cats = catNames.length
    ? await productModule.listProductCategories({ name: catNames })
    : []
  const categoryIds = cats.map((c: any) => c.id)
  if (catNames.length !== categoryIds.length) {
    logger.warn(`[import] categories resolved ${categoryIds.length}/${catNames.length} — check names`)
  }

  const scNames: string[] = d.sales_channel_names ?? []
  const scs = scNames.length
    ? await salesChannelModule.listSalesChannels({ name: scNames })
    : []
  const salesChannelIds = scs.map((s: any) => s.id)
  if (scNames.length !== salesChannelIds.length) {
    logger.warn(`[import] sales channels resolved ${salesChannelIds.length}/${scNames.length} — check names`)
  }

  let created = 0
  let updated = 0
  for (const p of data.products ?? []) {
    const currency = p.currency_code ?? d.currency_code ?? "eur"
    const images = (p.images ?? []).map((url: string) => ({ url }))
    const priceList = (amount: number | null | undefined) =>
      amount == null ? [] : [{ amount, currency_code: currency }]

    // Two product shapes are supported:
    //  1) An explicit `variants` array (e.g. pack sizes / Gebinde) — each entry
    //     becomes a variant, with its own optional SKU and price. Prices are
    //     optional (a catalog without prices imports as draft, priced later).
    //  2) The legacy `pack` shape — a single "{pack} Stück" variant with price.
    let optionTitle: string
    let optionValues: string[]
    let variants: any[]
    let subtitle: string

    if (Array.isArray(p.variants) && p.variants.length > 0) {
      optionTitle = d.option_title ?? "Gebinde"
      optionValues = p.variants.map((v: any) => v.title)
      variants = p.variants.map((v: any) => ({
        title: v.title,
        sku: v.sku,
        options: { [optionTitle]: v.title },
        prices: priceList(v.price ?? p.price),
      }))
      subtitle = p.subtitle ?? d.subtitle ?? ""
    } else {
      optionTitle = d.option_title ?? "Menge"
      const pack = p.pack ?? d.pack ?? 1000
      const optionValue = `${pack} Stück`
      optionValues = [optionValue]
      variants = [
        { title: optionValue, options: { [optionTitle]: optionValue }, prices: priceList(p.price) },
      ]
      subtitle = p.subtitle ?? d.subtitle ?? `Verpackungseinheit: ${pack} Stück`
    }

    const status = p.status ?? d.status ?? "draft"
    const description = p.description ?? d.description
    const thumbnail = p.thumbnail ?? p.images?.[0]

    // Existing product → update the mutable fields (copy, images, status,
    // metadata). Variants and links are left untouched so re-running never
    // duplicates variants. New product → create in full.
    const [existing] = await productModule.listProducts({ handle: p.handle }, { take: 1 })
    let productId: string
    if (existing) {
      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: existing.id },
          update: {
            title: p.title,
            subtitle,
            description,
            status,
            metadata: p.metadata ?? undefined,
            thumbnail,
            images,
          },
        },
      })
      productId = existing.id
      updated++
      logger.info(`[import] updated ${p.title} (${p.handle})`)
    } else {
      const { result } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: p.title,
              handle: p.handle,
              status,
              subtitle,
              description,
              metadata: p.metadata ?? undefined,
              thumbnail,
              images,
              category_ids: categoryIds,
              sales_channels: salesChannelIds.map((id: string) => ({ id })),
              options: [{ title: optionTitle, values: optionValues }],
              variants,
            },
          ],
        },
      })
      productId = (result as any[])[0].id
      created++
      logger.info(`[import] created ${p.title} (${p.handle})`)
    }

    // Per-locale translations (en/it). German stays on the base product row.
    for (const [loc, tr] of Object.entries(p.translations ?? {})) {
      const locale_code = LOCALE_MAP[loc] ?? loc
      if (locale_code === "de-DE") continue
      await upsertTranslation(productId, locale_code, tr as Record<string, string>)
    }
  }

  console.log(`IMPORT DONE: created=${created} updated=${updated} (from ${path.basename(jsonPath)})`)
}
