import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ARTICLE_MODULE } from "../../../modules/article"

/**
 * GET  /admin/article-authors  — list all authors.
 * POST /admin/article-authors  — create { name (required), slug?, linkedin_url?, … }.
 */

const slugify = (v: string) =>
  v.trim().toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

const clean = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const article_authors = await service.listArticleAuthors({}, { order: { name: "ASC" } })
  res.json({ article_authors })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(ARTICLE_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const name = clean(body.name)
  if (!name) {
    return res.status(400).json({ message: "A non-empty 'name' is required." })
  }
  const slug = slugify(clean(body.slug) || name)
  const [dupe] = await service.listArticleAuthors({ slug }, { take: 1 })
  if (dupe) {
    return res.status(409).json({ message: `An author with slug '${slug}' already exists.` })
  }

  const author = await service.createArticleAuthors({
    name,
    slug,
    role: clean(body.role),
    photo_url: clean(body.photo_url),
    linkedin_url: clean(body.linkedin_url),
    website_url: clean(body.website_url),
    xing_url: clean(body.xing_url),
    bio: clean(body.bio),
    bio_en: clean(body.bio_en),
    bio_it: clean(body.bio_it),
    active: body.active === false ? false : true,
  })

  res.json({ article_author: author })
}
