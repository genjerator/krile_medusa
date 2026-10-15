import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor, AUTHOR_NAME } from "./seed-article-author"

// LOCAL helper: ensure the author exists and set them on ALL existing articles.
// Not staged/committed — local only. (Prod gets the author via each seed script.)
export default async function setAuthorLocal({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)

  const author_id = await ensureArticleAuthor(container)
  const articles = await service.listArticles({}, { take: 1000 })

  for (const a of articles) {
    await service.updateArticles({ id: a.id, author_id })
  }

  logger.info(`[set-author] linked "${AUTHOR_NAME}" (${author_id}) to ${articles.length} articles.`)
}
