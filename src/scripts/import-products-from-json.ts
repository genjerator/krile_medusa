import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/core-flows"
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
const DEFAULT_JSON = path.join(__dirname, "data", "vakuumbeutel-products.json")

export default async function run({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const salesChannelModule: any = container.resolve(Modules.SALES_CHANNEL)

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
  let skipped = 0
  for (const p of data.products ?? []) {
    const [existing] = await productModule.listProducts({ handle: p.handle }, { take: 1 })
    if (existing) {
      skipped++
      logger.info(`[import] skip existing handle ${p.handle}`)
      continue
    }

    // Pack size (e.g. 1000 or 500) drives the option value, variant title and
    // subtitle — so a per-product `pack` fully describes the packaging unit.
    const optionTitle = d.option_title ?? "Menge"
    const pack = p.pack ?? d.pack ?? 1000
    const optionValue = `${pack} Stück`
    const subtitle = p.subtitle ?? d.subtitle ?? `Verpackungseinheit: ${pack} Stück`
    const images = (p.images ?? []).map((url: string) => ({ url }))

    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: p.title,
            handle: p.handle,
            status: p.status ?? d.status ?? "draft",
            subtitle,
            thumbnail: p.thumbnail ?? p.images?.[0],
            images,
            category_ids: categoryIds,
            sales_channels: salesChannelIds.map((id: string) => ({ id })),
            options: [{ title: optionTitle, values: [optionValue] }],
            variants: [
              {
                title: optionValue,
                options: { [optionTitle]: optionValue },
                prices: [
                  { amount: p.price, currency_code: p.currency_code ?? d.currency_code ?? "eur" },
                ],
              },
            ],
          },
        ],
      },
    })
    created++
    logger.info(`[import] created ${p.title} (${p.handle})`)
  }

  console.log(`IMPORT DONE: created=${created} skipped=${skipped} (from ${path.basename(jsonPath)})`)
}
