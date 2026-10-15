import { ARTICLE_MODULE } from "../modules/article"

/**
 * The magazine author for the vacuum-bag article series. Kept in one place so
 * every seed script links the same person (and prod creates them once).
 */
export const AUTHOR_NAME = "Evgenije Medjesi"
export const AUTHOR_SLUG = "evgenije-medjesi"

/**
 * Ensure the author exists and return their id. Idempotent (matched by slug), so
 * it is safe to call from every seed script.
 */
export async function ensureArticleAuthor(container: any): Promise<string> {
  const service: any = container.resolve(ARTICLE_MODULE)
  const [existing] = await service.listArticleAuthors({ slug: AUTHOR_SLUG }, { take: 1 })
  if (existing) return existing.id

  const created = await service.createArticleAuthors({
    name: AUTHOR_NAME,
    slug: AUTHOR_SLUG,
    active: true,
  })
  return created.id
}
