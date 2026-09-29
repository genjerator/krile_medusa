import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Link the "Silikonmatte hitzebeständig" article to every product in the
 * "Bügelsysteme" (bugelsysteme) category AND to the Silikonmatte product
 * itself, so each product's "Passende Artikel aus dem Magazin" section shows it.
 * Idempotent.
 *
 * Run: npx medusa exec ./src/scripts/link-silikonmatte-article-to-bugelsysteme.ts
 */
const CATEGORY_HANDLE = "bugelsysteme"
const EXTRA_PRODUCT_HANDLES = ["silikonmatte"]
const ARTICLE_SLUG = "silikonmatte-hitzebestaendig"

export default async function linkSilikonmatteToBugelsysteme({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const articleService: any = container.resolve(ARTICLE_MODULE)

  const [article] = await articleService.listArticles({ slug: ARTICLE_SLUG }, { take: 1, select: ["id", "slug"] })
  if (!article) throw new Error(`Article "${ARTICLE_SLUG}" not found.`)

  const { data: cats } = await query.graph({
    entity: "product_category",
    filters: { handle: CATEGORY_HANDLE },
    fields: ["id", "products.id", "products.title", "products.articles.id"],
  })
  const products: any[] = [...(cats[0]?.products ?? [])]

  // Add the standalone extra products (e.g. the Silikonmatte product itself).
  if (EXTRA_PRODUCT_HANDLES.length) {
    const { data: extra } = await query.graph({
      entity: "product",
      filters: { handle: EXTRA_PRODUCT_HANDLES },
      fields: ["id", "title", "articles.id"],
    })
    for (const e of extra) {
      if (!products.some((p) => p.id === e.id)) products.push(e)
    }
  }
  if (!products.length) throw new Error(`No products found in category "${CATEGORY_HANDLE}".`)

  const links: any[] = []
  for (const p of products) {
    const existing = new Set((p.articles ?? []).map((a: any) => a.id))
    if (existing.has(article.id)) {
      logger.info(`  = already linked: ${p.title}`)
      continue
    }
    links.push({
      [Modules.PRODUCT]: { product_id: p.id },
      [ARTICLE_MODULE]: { article_id: article.id },
    })
    logger.info(`  + link: ${p.title} ↔ ${ARTICLE_SLUG}`)
  }

  if (links.length) await link.create(links)
  logger.info(`✅ ${links.length} new link(s) across ${products.length} product(s) in "${CATEGORY_HANDLE}".`)
}
