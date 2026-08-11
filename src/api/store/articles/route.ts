import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../modules/article"
import { reqLocale, localizeArticleCard, channelScope } from "../../../lib/article-i18n"

/**
 * GET /store/articles?lang=de|en|it&limit=12&offset=0
 *
 * Published magazine articles (published_at <= now), newest first, paginated,
 * localised for the requested locale (fallback to German). Public route.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const locale = reqLocale(req)
  const limit = Math.min(Number(req.query.limit) || 12, 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const [articles, count] = await service.listAndCountArticles(
    { status: "published", published_at: { $lte: new Date() }, ...channelScope(req) },
    {
      relations: ["author"],
      order: { published_at: "DESC" },
      take: limit,
      skip: offset,
    }
  )

  res.json({
    articles: articles.map((a: any) => localizeArticleCard(a, locale)),
    count,
    limit,
    offset,
  })
}
