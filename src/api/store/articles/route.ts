import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../modules/article"
import { reqLocale, localizeArticleCard, channelScope } from "../../../lib/article-i18n"

/**
 * GET /store/articles?lang=de|en|it&limit=12&offset=0[&preview=true]
 *
 * Published magazine articles (published_at <= now), newest first, paginated,
 * localised for the requested locale (fallback to German). Public route.
 *
 * `preview` (accepts `preview=true|1|draft` or `krile=true`) is a draft-preview
 * escape hatch: it drops the published/published_at filter so DRAFT and
 * scheduled (future `published_at`) articles are listed too, and adds each
 * article's `status` so the storefront can mark drafts. Keep it unindexed /
 * uncached upstream.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const locale = reqLocale(req)
  const limit = Math.min(Number(req.query.limit) || 12, 50)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const preview =
    ["true", "1", "draft"].includes(String(req.query.preview)) ||
    req.query.krile === "true"

  const filters = preview
    ? { ...channelScope(req) }
    : { status: "published", published_at: { $lte: new Date() }, ...channelScope(req) }

  const [articles, count] = await service.listAndCountArticles(filters, {
    relations: ["author"],
    order: { published_at: "DESC" },
    take: limit,
    skip: offset,
  })

  res.json({
    articles: articles.map((a: any) =>
      preview
        ? { ...localizeArticleCard(a, locale), status: a.status }
        : localizeArticleCard(a, locale)
    ),
    count,
    limit,
    offset,
  })
}
