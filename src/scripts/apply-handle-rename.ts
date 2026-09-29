import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

import RENAMES from "./updates/planeta-handle-rename.json"

/**
 * Rename product handles: drop the "planeta-" prefix and the trailing
 * article-number suffix (e.g. planeta-beige-kariert-rapid-z-1884 -> beige-kariert-rapid-z).
 *
 * Reads the old->new map from src/scripts/updates/planeta-handle-rename.json.
 * Goes through updateProductsWorkflow so domain events fire (search reindex etc.).
 *
 * Idempotent: if the OLD handle is gone but the NEW one already exists, it's
 * treated as already-renamed and skipped. Aborts before writing if applying a
 * rename would collide with a different existing product.
 *
 * Local: pnpm medusa exec ./src/scripts/apply-handle-rename.ts
 * Prod:  docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/apply-handle-rename.js'
 */
type Rename = { old: string; neu: string }

export default async function applyHandleRename({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)

  const renames = RENAMES as Rename[]
  logger.info(`🔎 apply-handle-rename: ${renames.length} handle(s)`)

  let renamed = 0,
    already = 0,
    missing = 0,
    skipped = 0

  for (const { old, neu } of renames) {
    const [byOld] = await productModule.listProducts(
      { handle: old },
      { select: ["id", "handle"], take: 1 }
    )

    if (!byOld) {
      const [byNew] = await productModule.listProducts(
        { handle: neu },
        { select: ["id", "handle"], take: 1 }
      )
      if (byNew) {
        already++
      } else {
        logger.warn(`  ✗ neither "${old}" nor "${neu}" found`)
        missing++
      }
      continue
    }

    // guard: new handle already taken by a DIFFERENT product
    const [clash] = await productModule.listProducts(
      { handle: neu },
      { select: ["id", "handle"], take: 1 }
    )
    if (clash && clash.id !== byOld.id) {
      logger.error(`  ✗ "${neu}" already used by ${clash.id} — skipping "${old}"`)
      skipped++
      continue
    }

    await updateProductsWorkflow(container).run({
      input: { selector: { id: byOld.id }, update: { handle: neu } },
    })
    logger.info(`  ✓ ${old} -> ${neu}`)
    renamed++
  }

  console.log(
    `APPLY-HANDLE-RENAME DONE: renamed=${renamed} already=${already} missing=${missing} skipped=${skipped}`
  )
}
