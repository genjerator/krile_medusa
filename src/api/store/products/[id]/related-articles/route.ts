import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../../../../../modules/article"
import { reqLocale, localizeArticleCard, channelScope } from "../../../../../lib/article-i18n"

/**
 * GET /store/products/:id/related-articles?lang=de|en|it
 *
 * The published, channel-visible Magazin articles an admin linked to this
 * product, newest first, localised. Public route (publishable key scopes the
 * channel). Returns [] when the product has none.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const locale = reqLocale(req)

  const { data } = await query.graph({
    entity: "product",
    filters: { id: req.params.id },
    fields: ["id", "articles.id"],
  })
  const ids: string[] = ((data[0] as any)?.articles ?? []).map((a: any) => a.id)
  if (ids.length === 0) {
    return res.json({ articles: [] })
  }

  const articles = await service.listArticles(
    {
      id: ids,
      status: "published",
      published_at: { $lte: new Date() },
      ...channelScope(req),
    },
    { relations: ["author"], order: { published_at: "DESC" } }
  )

  res.json({ articles: articles.map((a: any) => localizeArticleCard(a, locale)) })
}
