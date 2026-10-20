import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Link the 9 newest published Magazin articles to every product in the
 * "vakuumiertuten-rollen" category, so each product's "Passende Artikel aus dem
 * Magazin" section shows them. Idempotent — existing links are skipped.
 *
 * Run (local): npx medusa exec ./src/scripts/link-latest-articles-to-vakuumtueten.ts
 * Run (prod):  ... npx medusa exec ./src/scripts/link-latest-articles-to-vakuumtueten.js
 */
const CATEGORY_HANDLE = "vakuumiertuten-rollen"
const ARTICLE_COUNT = 9

export default async function linkLatestArticles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const articleService: any = container.resolve(ARTICLE_MODULE)

  // The 9 newest published articles (newest first).
  const articles = await articleService.listArticles(
    { status: "published" },
    { take: ARTICLE_COUNT, order: { published_at: "DESC" }, select: ["id", "slug", "published_at"] }
  )
  if (!articles.length) throw new Error("No published articles found.")
  logger.info(`Latest ${articles.length} article(s): ${articles.map((a: any) => a.slug).join(", ")}`)

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
      if (existing.has(a.id)) continue
      links.push({
        [Modules.PRODUCT]: { product_id: p.id },
        [ARTICLE_MODULE]: { article_id: a.id },
      })
    }
  }

  if (links.length) await link.create(links)
  logger.info(
    `✅ ${links.length} new link(s) created across ${products.length} product(s) in "${CATEGORY_HANDLE}" (${articles.length} articles each).`
  )
}
