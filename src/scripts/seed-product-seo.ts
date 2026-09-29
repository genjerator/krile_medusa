import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

import SEO_UPDATES from "./updates/product-seo.json"

/**
 * Apply per-product SEO copy (title / subtitle / rich HTML description) and its
 * translations — WITHOUT raw SQL. Everything goes through Medusa's workflow /
 * module services so the normal domain events fire (search reindex, cache / ISR
 * invalidation). Idempotent and safe to re-run: base fields are overwritten with
 * the JSON values, translation rows are UPSERTED and MERGED (existing keys such
 * as `material` are preserved).
 *
 * Edit the data, not this script:  src/scripts/updates/product-seo.json
 *
 *   [
 *     {
 *       "handle": "rubin-dampfsauger",
 *       "base":         { "title": "...", "subtitle": "...", "description": "<p>…</p>" },
 *       "translations": {
 *         "de-DE": { "title": "...", "subtitle": "...", "description": "<p>…</p>" },
 *         "en-US": { ... },
 *         "it-IT": { ... }
 *       }
 *     }
 *   ]
 *
 * `base` = the default (German) product row. Include a "de-DE" translation
 * ONLY when the product already has one (German pages send locale `de-DE`, and a
 * de-DE row overrides `base`); the merge keeps any other keys on that row.
 * Products not present in this DB are skipped (logged), never fail.
 *
 * Local:  pnpm medusa exec ./src/scripts/seed-product-seo.ts
 * Prod:   docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/seed-product-seo.js'
 */

type LocaleFields = { title?: string; subtitle?: string; description?: string }
type SeoUpdate = {
  handle: string
  base?: LocaleFields
  translations?: Record<string, LocaleFields>
}

export default async function seedProductSeo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  const updates = SEO_UPDATES as SeoUpdate[]
  logger.info(`🔎 seed-product-seo: ${updates.length} product(s)`)

  let applied = 0,
    locales = 0,
    missing = 0

  for (const u of updates) {
    const [product] = await productModule.listProducts(
      { handle: u.handle },
      { select: ["id", "handle"], take: 1 }
    )
    if (!product) {
      logger.warn(`  ✗ no product for handle "${u.handle}"`)
      missing++
      continue
    }

    // ── base (German) product row ──────────────────────────────────────────
    const update: Record<string, any> = {}
    if (u.base?.title !== undefined) update.title = u.base.title
    if (u.base?.subtitle !== undefined) update.subtitle = u.base.subtitle
    if (u.base?.description !== undefined) update.description = u.base.description
    if (Object.keys(update).length) {
      await updateProductsWorkflow(container).run({
        input: { selector: { id: product.id }, update },
      })
    }

    // ── per-locale translations (upsert + merge) ───────────────────────────
    for (const [locale_code, fields] of Object.entries(u.translations ?? {})) {
      const existing = await translationModule.listTranslations({
        reference: "product",
        reference_id: product.id,
        locale_code,
      })
      if (existing?.[0]) {
        await translationModule.updateTranslations({
          id: existing[0].id,
          translations: { ...existing[0].translations, ...fields },
        })
      } else {
        await translationModule.createTranslations({
          reference: "product",
          reference_id: product.id,
          locale_code,
          translations: fields,
        })
      }
      locales++
    }

    logger.info(`  ✓ ${u.handle}`)
    applied++
  }

  console.log(
    `SEED-PRODUCT-SEO DONE: applied=${applied} locales=${locales} missing=${missing}`
  )
}
