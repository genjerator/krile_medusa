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
} from "./seed-article-vakuumbeutel-ratgeber"

// LOCAL helper: apply the latest article copy (from the seed script) to the
// existing record and publish it, so it shows at the plain /de|/en/magazin/<slug>
// URL. Not staged/committed — run only locally.
//
// Images are served from the krile storefront's public/ folder (local only). On
// prod these must be hosted URLs (S3) and the article updated accordingly.
//   - COVER   : editorial photo, used as cover/og/listing card only.
//   - DE / EN : the comparison infographics, embedded INLINE in each language's
//               body (the article page does NOT render cover_image).
const COVER = "/magazin/vakuumbeutel-glatt-und-strukturiert.jpg"
const IMG_DE = "/magazin/vakuumbeutel-strukturiert-oder-glatt.jpg"
const IMG_EN = "/magazin/vacuum-bags-chamber-vs-external-en.jpg"

const ALT_DE =
  "Vergleich: glatte Kammerbeutel für Kammervakuumierer vs. strukturierte Beutel für Außenvakuumierer"
const ALT_EN =
  "Comparison: smooth chamber bags vs. embossed external-suction vacuum bags"

const figure = (src: string, alt: string) =>
  `<p><img src="${src}" alt="${alt}" title="${alt}" ` +
  `style="max-width:100%;height:auto;border:1px solid #D9E0DD;border-radius:4px;display:block;margin:10px 0 4px;"/></p>`

// Inject each infographic right after the "two bag types" heading of its locale.
const BODY_DE_IMG = BODY.replace(
  "<h2>Die zwei Beuteltypen</h2>",
  `${figure(IMG_DE, ALT_DE)}\n\n<h2>Die zwei Beuteltypen</h2>`
)
const BODY_EN_IMG = BODY_EN.replace(
  "<h2>The two bag types</h2>",
  `${figure(IMG_EN, ALT_EN)}\n\n<h2>The two bag types</h2>`
)

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
