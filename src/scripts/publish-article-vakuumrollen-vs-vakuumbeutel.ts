import { ExecArgs } from "@medusajs/framework/types"
import { ARTICLE_MODULE } from "../modules/article"
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
} from "./seed-article-vakuumrollen-vs-vakuumbeutel"

// Publishes the article (create-or-update): apply the latest copy (from the seed
// script) to the existing record and publish it, so it shows at the plain
// /de|/en/magazin/<slug> URL. Committed: safe to run on prod.
//
// COVER: dedicated "Vakuumrollen vs. Vakuumbeutel – was ist günstiger?" banner,
// served from each storefront's public/magazin/ (and mirrored to S3 by
// repoint-magazin-covers-to-s3.ts for cross-storefront rendering on prod). The
// article page does NOT render the cover inside the body, so no inline injection.
const COVER =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/magazin/vakuumrollen-oder-vakuumbeutel-kosten.jpg"

const ALT_DE = "Vakuumrollen und Vakuumbeutel im Preisvergleich – was ist günstiger?"
const ALT_EN = "Vacuum rolls vs. pre-made vacuum bags – cost comparison"

// The article page does NOT render cover_image inside the body, so we embed the
// same banner as a hero image at the top of each language's body.
const figure = (src: string, alt: string) =>
  `<p><img src="${src}" alt="${alt}" title="${alt}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>`

const BODY_DE_IMG = `${figure(COVER, ALT_DE)}\n\n${BODY}`
const BODY_EN_IMG = `${figure(COVER, ALT_EN)}\n\n${BODY_EN}`

export default async function applyAndPublishLocal({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const service: any = container.resolve(ARTICLE_MODULE)

  const fields = {
    title: TITLE,
    category: CATEGORY,
    excerpt: EXCERPT,
    body: BODY_DE_IMG,
    meta_title: META_TITLE,
    meta_description: META_DESCRIPTION,
    title_en: TITLE_EN,
    excerpt_en: EXCERPT_EN,
    body_en: BODY_EN_IMG,
    meta_title_en: META_TITLE_EN,
    meta_description_en: META_DESCRIPTION_EN,
    cover_image: COVER,
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
