import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../../modules/article"

/**
 * GET    /admin/article-authors/:id  — read one author.
 * POST   /admin/article-authors/:id  — partial update.
 * DELETE /admin/article-authors/:id  — soft delete.
 */

const TEXT_FIELDS = [
  "name", "slug", "role", "photo_url",
  "linkedin_url", "website_url", "xing_url",
  "bio", "bio_en", "bio_it",
] as const

const clean = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const author = await service.retrieveArticleAuthor(req.params.id).catch(() => null)
  if (!author) {
    return res.status(404).json({ message: "Author not found." })
  }
  res.json({ article_author: author })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const id = req.params.id
  const body = (req.body ?? {}) as Record<string, unknown>

  const existing = await service.retrieveArticleAuthor(id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ message: "Author not found." })
  }

  const patch: Record<string, unknown> = {}
  for (const f of TEXT_FIELDS) {
    if (f in body) patch[f] = clean(body[f])
  }
  // 'name' must never be nulled out.
  if ("name" in body && patch.name === null) delete patch.name
  if ("active" in body) patch.active = body.active === false ? false : true

  const author = await service.updateArticleAuthors({ id, ...patch })
  res.json({ article_author: author })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  await service.deleteArticleAuthors(req.params.id)
  res.json({ id: req.params.id, object: "article_author", deleted: true })
}
