import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

import MEAL_TAGS from "./updates/product-meal-tags.json"

/**
 * Attach "meal / dish" product tags (Fisch, Geflügel, Grill & BBQ, …) to the
 * Pacovis food products WITHOUT raw SQL — tags go through the product module and
 * the update runs through updateProductsWorkflow so domain events fire (search
 * reindex, ISR/cache invalidation). Idempotent, safe to re-run.
 *
 * Data lives in the co-located JSON file (edit that, not this script):
 *   updates/product-meal-tags.json  → [{ handle, tags: string[] }]
 *
 * Tag values are matched/created by their `value` string (German, one per tag).
 * Products not present in this DB are skipped (logged), never fatal.
 *
 * Local:  pnpm medusa exec ./src/scripts/apply-meal-tags.ts
 * Prod :  docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/apply-meal-tags.js'
 */

type MealTagEntry = { handle: string; tags: string[] }

export default async function applyMealTags({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)

  const entries = MEAL_TAGS as MealTagEntry[]

  // ── 1) Ensure every tag value exists, resolve value → id ──────────────────
  const wanted = [...new Set(entries.flatMap((e) => e.tags))]
  const existing = await productModule.listProductTags(
    { value: wanted },
    { select: ["id", "value"] }
  )
  const idByValue = new Map<string, string>(
    existing.map((t: any) => [t.value, t.id])
  )

  const toCreate = wanted.filter((v) => !idByValue.has(v))
  if (toCreate.length) {
    const created = await productModule.createProductTags(
      toCreate.map((value) => ({ value }))
    )
    for (const t of created) idByValue.set(t.value, t.id)
    logger.info(`🏷  created ${created.length} tag(s): ${toCreate.join(", ")}`)
  }

  // ── 2) Set each product's tags by handle ──────────────────────────────────
  let tagged = 0,
    missing = 0
  logger.info(`🍽  meal tags: ${entries.length} product(s)`)
  for (const e of entries) {
    const [product] = await productModule.listProducts(
      { handle: e.handle },
      { select: ["id", "handle"], take: 1 }
    )
    if (!product) {
      logger.warn(`  ✗ no product for handle "${e.handle}"`)
      missing++
      continue
    }

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        // `tags` is supported at runtime but missing from the update DTO type.
        update: { tags: e.tags.map((value) => ({ id: idByValue.get(value)! })) } as any,
      },
    })
    logger.info(`  ✓ ${e.handle} → ${e.tags.join(", ")}`)
    tagged++
  }

  console.log(`MEAL TAGS DONE: tagged=${tagged} missing=${missing}`)
}
