import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * One-off cleanup: an earlier author-resolution fallback created a duplicate
 * author "Evgenije" (slug "evgenije") alongside the real "Evgenije Medjesi"
 * (slug "evgenije-medjesi"). This repoints every article on the duplicate to
 * the real author and deletes the duplicate. Idempotent.
 *
 * Run: npx medusa exec ./src/scripts/consolidate-article-author.ts
 */
const KEEP_SLUG = "evgenije-medjesi"
const DUPE_SLUG = "evgenije"

export default async function consolidateArticleAuthor({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)

  const [keep] = await service.listArticleAuthors({ slug: KEEP_SLUG }, { take: 1 })
  if (!keep) throw new Error(`Author "${KEEP_SLUG}" (Evgenije Medjesi) not found — nothing to consolidate onto.`)

  const [dupe] = await service.listArticleAuthors({ slug: DUPE_SLUG }, { take: 1 })
  if (!dupe) {
    logger.info(`No duplicate author "${DUPE_SLUG}" found — already consolidated.`)
    return
  }

  const articles = await service.listArticles({ author_id: dupe.id }, { take: 1000, select: ["id", "slug"] })
  for (const a of articles) {
    await service.updateArticles({ id: a.id, author_id: keep.id })
    logger.info(`  repointed '${a.slug}' → ${KEEP_SLUG}`)
  }

  await service.deleteArticleAuthors(dupe.id)
  logger.info(`✅ Consolidated ${articles.length} article(s) onto ${KEEP_SLUG} and deleted duplicate "${DUPE_SLUG}" (${dupe.id}).`)
}
