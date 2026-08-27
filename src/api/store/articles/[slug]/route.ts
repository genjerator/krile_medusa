import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../../modules/article"
import { reqLocale, localizeArticleFull, channelScope } from "../../../../lib/article-i18n"

/**
 * GET /store/articles/:slug?lang=de|en|it[&preview=true]
 *
 * A single published article (published_at <= now) localised for the requested
 * locale, incl. body + resolved SEO meta. 404 if not found / not published.
 *
 * `preview=true` (also accepts `krile=true`) is a draft-preview escape hatch:
 * it drops the published/channel filters so drafts and scheduled (future
 * `published_at`) articles can be viewed by slug. Used by the storefront's
 * `?krile=true` preview link — keep it unindexed / uncached upstream.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const locale = reqLocale(req)
  // Tolerate a stray trailing dot / whitespace (e.g. a URL copied after a period).
  const slug = (req.params.slug ?? "").trim().replace(/[.\s]+$/, "")

  const preview = req.query.preview === "true" || req.query.krile === "true"
  const filters = preview
    ? { slug }
    : { slug, status: "published", published_at: { $lte: new Date() }, ...channelScope(req) }

  const [article] = await service.listArticles(filters, {
    relations: ["author"],
    take: 1,
  })
  if (!article) {
    return res.status(404).json({ article: null })
  }

  res.json({ article: localizeArticleFull(article, locale) })
}
