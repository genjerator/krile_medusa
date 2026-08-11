import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../modules/article"

/**
 * GET  /admin/articles   — list all articles (any status), newest first.
 * POST /admin/articles   — create an article { title (required), slug?, status?, … }.
 *
 * Direct module-service CRUD (contentBlock convention). Empty strings are stored
 * as null so the storefront falls back to German.
 */

const slugify = (v: string) =>
  v.trim().toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

const clean = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const articles = await service.listArticles(
    {},
    { relations: ["author"], order: { created_at: "DESC" } }
  )
  res.json({ articles })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const title = clean(body.title)
  if (!title) {
    return res.status(400).json({ message: "A non-empty 'title' is required." })
  }

  const slug = slugify(clean(body.slug) || title)
  if (!slug) {
    return res.status(400).json({ message: "Could not derive a valid slug." })
  }
  const [dupe] = await service.listArticles({ slug }, { take: 1 })
  if (dupe) {
    return res.status(409).json({ message: `An article with slug '${slug}' already exists.` })
  }

  const status = body.status === "published" ? "published" : "draft"
  let published_at: Date | null = null
  if (clean(body.published_at)) {
    published_at = new Date(body.published_at as string)
  } else if (status === "published") {
    published_at = new Date()
  }

  const article = await service.createArticles({
    slug,
    title,
    status,
    published_at,
    cover_image: clean(body.cover_image),
    category: clean(body.category),
    sales_channel_id: clean(body.sales_channel_id),
    author_id: clean(body.author_id),
    title_en: clean(body.title_en),
    title_it: clean(body.title_it),
    excerpt: clean(body.excerpt),
    excerpt_en: clean(body.excerpt_en),
    excerpt_it: clean(body.excerpt_it),
    body: clean(body.body),
    body_en: clean(body.body_en),
    body_it: clean(body.body_it),
    meta_title: clean(body.meta_title),
    meta_title_en: clean(body.meta_title_en),
    meta_title_it: clean(body.meta_title_it),
    meta_description: clean(body.meta_description),
    meta_description_en: clean(body.meta_description_en),
    meta_description_it: clean(body.meta_description_it),
  })

  res.json({ article })
}
