import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

import IMAGE_MAP from "./updates/product-images-all.json"

/**
 * Update ALL product photos from what actually exists on S3, matched by handle.
 *
 * The mapping (updates/product-images-all.json) is generated from the live S3
 * bucket, preferring the curated images in this order:
 *   1. products/planeta/<handle>.jpg   (re-shot / watermark-removed)
 *   2. products/pacovis/<handle>.png   (catalog extract)
 *   3. planeta_admin/<handle>-<ULID>.…  (newest large admin upload)
 *
 * For each product found by handle it sets thumbnail + a single image to that
 * URL. Runs through the product workflow (fires reindex / cache invalidation),
 * is idempotent, and silently skips handles with no product on this DB.
 *
 * Local:  pnpm medusa exec ./src/scripts/sync-product-images.ts
 * Prod :  docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/sync-product-images.js'
 */

type Row = { handle: string; url: string }

export default async function syncProductImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)

  const rows = IMAGE_MAP as Row[]
  logger.info(`🖼  sync-product-images: ${rows.length} mapped image(s)`)

  let updated = 0,
    unchanged = 0,
    missing = 0

  for (const { handle, url } of rows) {
    const [product] = await productModule.listProducts(
      { handle },
      { select: ["id", "handle", "thumbnail"], take: 1 }
    )
    if (!product) {
      missing++
      continue
    }
    if (product.thumbnail === url) {
      unchanged++
      continue
    }
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: { thumbnail: url, images: [{ url }] },
      },
    })
    updated++
  }

  console.log(
    `SYNC IMAGES DONE: updated=${updated} unchanged=${unchanged} not_on_this_db=${missing}`
  )
}
