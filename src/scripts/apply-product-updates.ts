import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

import IMAGE_UPDATES from "./updates/product-images.json"
import PACO_UPDATES from "./updates/product-paco.json"

/**
 * Apply the latest product data changes WITHOUT raw SQL — everything goes
 * through Medusa's module services / workflows, so the normal domain events fire
 * (search reindex, cache / ISR invalidation). Idempotent, safe to re-run.
 *
 * Data lives in co-located JSON files (edit those, not this script):
 *   - updates/product-images.json  → [{ handle, url }]              thumbnail + sole image
 *   - updates/product-paco.json    → [{ current_handle, new_handle, title, description?, translations }]
 *
 * The images are already on the shared S3 bucket, so this only points the DB
 * rows at them. Products not present in this DB are skipped (logged), never fail.
 *
 * Local:  pnpm medusa exec ./src/scripts/apply-product-updates.ts
 * Prod:   docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/apply-product-updates.js'
 */

type ImageUpdate = { handle: string; url: string }
type PacoUpdate = {
  current_handle: string
  new_handle: string
  title: string
  description?: string | null
  translations?: Record<string, Record<string, string>>
}

export default async function applyProductUpdates({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  const images = IMAGE_UPDATES as ImageUpdate[]
  const paco = PACO_UPDATES as PacoUpdate[]

  let renamed = 0,
    imaged = 0,
    missing = 0

  // ── 1) "Paco" cleanup: rename handle, fix title/description, translations ──
  logger.info(`🔤 paco cleanup: ${paco.length} product(s)`)
  for (const p of paco) {
    const [product] = await productModule.listProducts(
      { handle: [p.current_handle, p.new_handle] },
      { select: ["id", "handle"], take: 1 }
    )
    if (!product) {
      logger.warn(`  ✗ no product for ${p.current_handle} / ${p.new_handle}`)
      missing++
      continue
    }

    const update: Record<string, any> = { title: p.title }
    if (p.new_handle) update.handle = p.new_handle
    if (p.description != null) update.description = p.description

    await updateProductsWorkflow(container).run({
      input: { selector: { id: product.id }, update },
    })

    for (const [locale_code, fields] of Object.entries(p.translations ?? {})) {
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
    }
    logger.info(`  ✓ ${p.current_handle} → ${p.new_handle} ("${p.title}")`)
    renamed++
  }

  // ── 2) Images: set thumbnail + sole image (files already on S3) ──────────
  logger.info(`🖼  images: ${images.length} product(s)`)
  for (const img of images) {
    const [product] = await productModule.listProducts(
      { handle: img.handle },
      { select: ["id", "handle"], take: 1 }
    )
    if (!product) {
      logger.warn(`  ✗ no product for handle "${img.handle}"`)
      missing++
      continue
    }
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: { thumbnail: img.url, images: [{ url: img.url }] },
      },
    })
    imaged++
  }

  console.log(
    `APPLY DONE: renamed/cleaned=${renamed} imaged=${imaged} missing=${missing}`
  )
}
