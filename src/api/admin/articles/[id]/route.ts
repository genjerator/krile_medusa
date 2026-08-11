import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../../modules/article"

/**
 * GET    /admin/articles/:id  — read one article (all locales + author).
 * POST   /admin/articles/:id  — partial update (only provided fields).
 * DELETE /admin/articles/:id  — soft delete.
 *
 * Empty strings → null (storefront falls back to German). Direct module-service
 * CRUD (contentBlock convention).
 */

const TEXT_FIELDS = [
  "slug", "cover_image", "category", "author_id", "sales_channel_id",
  "title", "title_en", "title_it",
  "excerpt", "excerpt_en", "excerpt_it",
  "body", "body_en", "body_it",
  "meta_title", "meta_title_en", "meta_title_it",
  "meta_description", "meta_description_en", "meta_description_it",
] as const

const clean = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const [article] = await service.listArticles(
    { id: req.params.id },
    { relations: ["author"], take: 1 }
  )
  if (!article) {
    return res.status(404).json({ message: "Article not found." })
  }
  res.json({ article })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const id = req.params.id
  const body = (req.body ?? {}) as Record<string, unknown>

  const existing = await service.retrieveArticle(id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ message: "Article not found." })
  }

  const patch: Record<string, unknown> = {}
  for (const f of TEXT_FIELDS) {
    if (f in body) patch[f] = clean(body[f])
  }
  // 'title' must never be nulled out.
  if ("title" in body && patch.title === null) delete patch.title
  if ("status" in body) {
    patch.status = body.status === "published" ? "published" : "draft"
  }
  if ("published_at" in body) {
    patch.published_at = clean(body.published_at) ? new Date(body.published_at as string) : null
  }

  const article = await service.updateArticles({ id, ...patch })
  res.json({ article })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  await service.deleteArticles(req.params.id)
  res.json({ id: req.params.id, object: "article", deleted: true })
}
