import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
import { ensureArticleAuthor } from "./seed-article-author"
import {
  SLUG,
  TITLE,
  CATEGORY,
  EXCERPT,
  META_TITLE,
  META_DESCRIPTION,
  BODY,
  TITLE_EN,
  EXCERPT_EN,
  META_TITLE_EN,
  META_DESCRIPTION_EN,
  BODY_EN,
} from "./seed-article-kaese-wurst-aufschnitt"

// Publishes the article (create-or-update): apply the latest copy (DE + EN), add the image + author, and
// publish so the article shows at /de|/en/magazin/<slug>. Committed: safe to run on prod.
// The /magazin/*.jpg image is served by the storefront's public/magazin/ folder on both local and prod.
const IMG = "/magazin/kaese-wurst-aufschnitt-vakuumiert.jpg"
const ALT =
  "Verschiedene Käsesorten, Wurst und Aufschnitt vakuumverpackt auf einer Küchenarbeitsplatte"

const FIGURE =
  `<p><img src="${IMG}" alt="${ALT}" title="${ALT}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:0 0 6px;"/></p>`

const BODY_DE_IMG = `${FIGURE}\n\n${BODY}`
const BODY_EN_IMG = `${FIGURE}\n\n${BODY_EN}`

export default async function applyAndPublishLocal({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)

  const author_id = await ensureArticleAuthor(container)

  const fields = {
    title: TITLE,
    category: CATEGORY,
    excerpt: EXCERPT,
    body: BODY_DE_IMG,
    cover_image: IMG,
    meta_title: META_TITLE,
    meta_description: META_DESCRIPTION,
    title_en: TITLE_EN,
    excerpt_en: EXCERPT_EN,
    body_en: BODY_EN_IMG,
    meta_title_en: META_TITLE_EN,
    meta_description_en: META_DESCRIPTION_EN,
    author_id,
    status: "published",
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })

  if (existing) {
    await service.updateArticles({
      id: existing.id,
      ...fields,
      published_at: existing.published_at ?? new Date(),
    })
    logger.info(`[apply-local] updated + published '${SLUG}' (id=${existing.id}).`)
  } else {
    const created = await service.createArticles({
      slug: SLUG,
      ...fields,
      published_at: new Date(),
    })
    logger.info(`[apply-local] created + published '${SLUG}' (id=${created.id}).`)
  }
}
