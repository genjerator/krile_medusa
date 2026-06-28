import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ImproveProductPayload } from "./improve-product.data"
import { VAKUUMIERMASCHINEN_PAYLOADS } from "./improve-product.vakuumiermaschinen.data"

/**
 * Apply the copy improvements produced by the `/improve-product` command.
 *
 * The copy lives in per-category data files (`improve-product.data.ts`,
 * `improve-product.bugelsysteme.data.ts`, …), merged below into PAYLOADS so a
 * single run applies them all. Keeping copy out of this file avoids corruption
 * via copy-paste. Runs through Medusa's module services (not raw SQL), so the
 * change fires the normal domain events — search reindex, cache/ISR invalidation.
 * Idempotent.
 *
 * Local:
 *   medusa exec ./src/scripts/improve-product.ts
 *
 * Prod (after deploy, inside the container — same as the seeders):
 *   docker exec app-medusa-1 sh -c 'pnpm medusa exec ./src/scripts/improve-product.js'
 */

const PAYLOADS: ImproveProductPayload[] = [...VAKUUMIERMASCHINEN_PAYLOADS]

export default async function improveProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  logger.info(`🛠  improve-product: ${PAYLOADS.length} product(s)`)
  for (const payload of PAYLOADS) {
    await applyOne(payload, { container, logger, query, productModule, translationModule })
  }
  logger.info(`✅ improve-product done (${PAYLOADS.length} product(s))`)
}

async function applyOne(
  payload: ImproveProductPayload,
  { container, logger, query, productModule, translationModule }: any
) {
  const productId = payload.productId
  logger.info(`— ${productId}`)

  // ─── Fetch current product (metadata + existing tags) ───────────────────
  const { data: found } = await query.graph({
    entity: "product",
    filters: { id: productId },
    fields: ["id", "metadata", "tags.id"],
  })
  const product = found[0] as any
  if (!product) {
    throw new Error(`Product ${productId} not found in this database.`)
  }

  // ─── Work out which legacy keys to strip, and the SEO keys to merge ──────
  // updateProducts MERGES metadata (it doesn't replace, and null just nulls the
  // value), so the merge adds the SEO keys; the woo_* keys are physically removed
  // afterwards with a jsonb `-` via the pg connection (see below).
  const stripPrefixes = payload.metadata?.stripPrefixes ?? []
  const currentMeta: Record<string, unknown> = product.metadata ?? {}
  const strippedKeys = Object.keys(currentMeta).filter((k) =>
    stripPrefixes.some((p) => k.startsWith(p))
  )
  const seoMeta = payload.metadata?.set ?? {}

  // ─── Ensure tags exist; union with the product's current tags ───────────
  let tagIds: { id: string }[] | undefined
  if (payload.tags?.length) {
    const existingTags = await productModule.listProductTags({ value: payload.tags })
    const existingValues = existingTags.map((t) => t.value)
    const missing = payload.tags.filter((v) => !existingValues.includes(v))
    const createdTags = missing.length
      ? await productModule.createProductTags(missing.map((value) => ({ value })))
      : []
    const desiredIds = [...existingTags, ...createdTags].map((t) => t.id)
    const currentIds: string[] = (product.tags ?? []).map((t: any) => t.id)
    tagIds = Array.from(new Set([...currentIds, ...desiredIds])).map((id) => ({ id }))
  }

  // ─── Update the product row (default locale = German) ───────────────────
  const updateData: Record<string, unknown> = { metadata: seoMeta }
  if (payload.handle !== undefined) updateData.handle = payload.handle
  if (payload.base?.title !== undefined) updateData.title = payload.base.title
  if (payload.base?.subtitle !== undefined) updateData.subtitle = payload.base.subtitle
  if (payload.base?.description !== undefined) updateData.description = payload.base.description
  if (tagIds) updateData.tags = tagIds

  await productModule.updateProducts({ id: productId }, updateData)
  logger.info(`✓ Updated product ${productId} base fields + SEO metadata`)
  if (tagIds) logger.info(`  tags now: ${tagIds.length}`)

  // Physically remove the legacy keys (the merge above can't delete them).
  if (strippedKeys.length) {
    const pg: any = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const delExpr = strippedKeys.map(() => "- ?").join(" ")
    await pg.raw(`update product set metadata = metadata ${delExpr} where id = ?`, [
      ...strippedKeys,
      productId,
    ])
    logger.info(`  stripped metadata keys: ${strippedKeys.join(", ")}`)
  }

  // ─── Upsert translations ────────────────────────────────────────────────
  for (const [locale_code, translations] of Object.entries(payload.translations ?? {})) {
    const existing = await translationModule.listTranslations({
      reference_id: productId,
      reference: "product",
      locale_code,
    })
    if (existing[0]) {
      await translationModule.updateTranslations({ id: existing[0].id, translations })
      logger.info(`  ✓ updated ${locale_code} translation`)
    } else {
      await translationModule.createTranslations({
        reference_id: productId,
        reference: "product",
        locale_code,
        translations,
      })
      logger.info(`  ✓ created ${locale_code} translation`)
    }
  }

  logger.info(`  ✓ done ${productId}`)
}
