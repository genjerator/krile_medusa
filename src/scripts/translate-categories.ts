import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { CATEGORY_TRANSLATIONS } from "./translate-categories.data"

/**
 * Apply category name/description copy: the source-language `description` onto the
 * `product_category` row, plus name + description translations into the Translation
 * module.
 *
 * Built like improve-product: the copy is baked into `translate-categories.data.ts`
 * (so nothing is corrupted via copy-paste) and applied through the Product +
 * Translation modules — not raw SQL — so the change fires the normal domain events
 * (search reindex, cache/ISR invalidation). Idempotent: re-running upserts each
 * locale and re-sets the base description.
 *
 * Translations are keyed by (reference="product_category", reference_id, locale_code),
 * matching how product translations are stored. Only the non-source locales are
 * written (German-source categories get en-US + it-IT; the English-source
 * MULTIVAC categories get de-DE + it-IT — their English base row is the source).
 * When upserting, the new fields are MERGED into the existing translation row so a
 * description update never clobbers a previously stored name (and vice versa).
 *
 * Local:
 *   medusa exec ./src/scripts/translate-categories.ts
 *
 * Prod (after deploy, inside the container — same as the seeders):
 *   docker exec app-medusa-1 sh -c 'pnpm medusa exec ./src/scripts/translate-categories.js'
 */
export default async function translateCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule: any = container.resolve(Modules.PRODUCT)
  const translationModule: any = container.resolve(Modules.TRANSLATION)

  let created = 0
  let updated = 0
  let baseSet = 0
  logger.info(`🌍 translate-categories: ${CATEGORY_TRANSLATIONS.length} categ/y(ies)`)

  for (const payload of CATEGORY_TRANSLATIONS) {
    // Guard against typos in pasted ids: skip (don't throw) if the category is gone.
    const { data: found } = await query.graph({
      entity: "product_category",
      filters: { id: payload.categoryId },
      fields: ["id", "name"],
    })
    const category = found[0] as any
    if (!category) {
      logger.warn(`  ⚠ skipped — category ${payload.categoryId} not found`)
      continue
    }
    logger.info(`— ${category.name} (${payload.categoryId})`)

    // Base (source-language) description on the product_category row.
    if (payload.baseDescription !== undefined) {
      await productModule.updateProductCategories(payload.categoryId, {
        description: payload.baseDescription,
      })
      baseSet++
      logger.info(`  ✓ base description set`)
    }

    for (const [locale_code, fields] of Object.entries(payload.translations)) {
      const existing = await translationModule.listTranslations({
        reference_id: payload.categoryId,
        reference: "product_category",
        locale_code,
      })
      if (existing[0]) {
        // Merge so updating one field (e.g. description) keeps the other (name).
        const merged = { ...(existing[0].translations ?? {}), ...fields }
        await translationModule.updateTranslations({ id: existing[0].id, translations: merged })
        updated++
        logger.info(`  ✓ updated ${locale_code}`)
      } else {
        await translationModule.createTranslations({
          reference_id: payload.categoryId,
          reference: "product_category",
          locale_code,
          translations: fields,
        })
        created++
        logger.info(`  ✓ created ${locale_code}`)
      }
    }
  }

  logger.info(
    `✅ translate-categories done (${baseSet} base descriptions, ${created} created, ${updated} updated across ${CATEGORY_TRANSLATIONS.length} categories)`
  )
}
