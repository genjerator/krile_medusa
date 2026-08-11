import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../../modules/article"
import { reqLocale, localizeAuthor, localizeArticleCard, channelScope } from "../../../../lib/article-i18n"

/**
 * GET /store/article-authors/:slug?lang=de|en|it
 *
 * A single active author (localised bio) plus their published articles — for the
 * author page /<locale>/magazin/autor/<slug>. 404 if not found / inactive.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const locale = reqLocale(req)

  const [author] = await service.listArticleAuthors(
    { slug: req.params.slug, active: true },
    { take: 1 }
  )
  if (!author) {
    return res.status(404).json({ author: null, articles: [] })
  }

  const articles = await service.listArticles(
    { author_id: author.id, status: "published", published_at: { $lte: new Date() }, ...channelScope(req) },
    { order: { published_at: "DESC" } }
  )

  res.json({
    author: localizeAuthor(author, locale),
    articles: articles.map((a: any) => localizeArticleCard(a, locale)),
  })
}
