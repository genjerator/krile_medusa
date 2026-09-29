import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Link today's two consumer articles to every product in the
 * "Vakuumiergeräte für Zuhause" (haushalts-vakuumier-maschinen) category, so
 * each product's "Passende Artikel aus dem Magazin" section shows them.
 * Idempotent — existing links are skipped.
 *
 * Run: npx medusa exec ./src/scripts/link-today-articles-to-home-category.ts
 */
const CATEGORY_HANDLE = "haushalts-vakuumier-maschinen"
const ARTICLE_SLUGS = [
  "zu-viel-gekocht-reste-vakuumieren",
  "deutsche-gerichte-vakuumieren",
]

export default async function linkTodayArticles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const articleService: any = container.resolve(ARTICLE_MODULE)

  // Resolve the two articles.
  const articles = await articleService.listArticles(
    { slug: ARTICLE_SLUGS },
    { take: 10, select: ["id", "slug"] }
  )
  if (articles.length !== ARTICLE_SLUGS.length) {
    throw new Error(`Expected ${ARTICLE_SLUGS.length} articles, found ${articles.length}: ${articles.map((a: any) => a.slug).join(", ")}`)
  }

  // Products in the category, with their currently linked article ids.
  const { data: cats } = await query.graph({
    entity: "product_category",
    filters: { handle: CATEGORY_HANDLE },
    fields: ["id", "products.id", "products.title", "products.articles.id"],
  })
  const products = cats[0]?.products ?? []
  if (!products.length) throw new Error(`No products found in category "${CATEGORY_HANDLE}".`)

  const links: any[] = []
  for (const p of products) {
    const existing = new Set((p.articles ?? []).map((a: any) => a.id))
    for (const a of articles) {
      if (existing.has(a.id)) {
        logger.info(`  = already linked: ${p.title} ↔ ${a.slug}`)
        continue
      }
      links.push({
        [Modules.PRODUCT]: { product_id: p.id },
        [ARTICLE_MODULE]: { article_id: a.id },
      })
      logger.info(`  + link: ${p.title} ↔ ${a.slug}`)
    }
  }

  if (links.length) await link.create(links)
  logger.info(`✅ ${links.length} new link(s) created across ${products.length} product(s) in "${CATEGORY_HANDLE}".`)
}
