import fs from "fs"
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * One-off: create the "Im Rausch der Sterne / MULTIVAC" magazine article.
 * The body HTML is read from the working draft in Downloads (single source of
 * truth), so image/link edits made there flow straight into the article.
 *
 * Run: npx medusa exec ./src/scripts/seed-article-multivac.ts
 */
const HTML_PATH =
  "/Users/genjerator/Downloads/multivac-im-rausch-der-sterne.html"

const COVER_IMAGE =
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com/planeta_admin/magazin/burnt-cover.jpg"

const SLUG = "im-rausch-der-sterne-multivac"

export default async function seedArticleMultivac({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service: any = container.resolve(ARTICLE_MODULE)

  // 1) Extract the body between the REAL marker comments (note the "=====" —
  // anchoring on those avoids matching the "BODY START" mention in the top
  // instructions comment).
  const html = fs.readFileSync(HTML_PATH, "utf8")
  const m = html.match(/<!--\s*=+\s*BODY START[\s\S]*?-->([\s\S]*?)<!--\s*=+\s*BODY END/)
  if (!m) throw new Error("Could not find BODY START/END markers in the HTML file")
  let body = m[1].trim()

  // Strip editing-only decoration: the placeholder styling classes and the 🔗
  // emoji prefix on links (real hrefs are kept).
  body = body.replace(/\s*class="ph-(?:link|img)"/g, "")
  body = body.replace(/🔗\s*/g, "")

  if (body.includes("ph-link") || body.includes("ph-img") || body.includes("<style") || body.includes("<head")) {
    logger.warn("Body still contains placeholder/markup leakage — check the extraction.")
  }

  // 2) Find or create the author "Evgenije".
  // Use the existing "Evgenije Medjesi" author — never create a new one.
  const [author] = await service.listArticleAuthors({ slug: "evgenije-medjesi" }, { take: 1 })
  if (!author) {
    throw new Error(
      'Author "evgenije-medjesi" (Evgenije Medjesi) not found — add it once via admin. Seed scripts never create authors.'
    )
  } else {
    logger.info(`Reusing existing author Evgenije (${author.id})`)
  }

  // 3) Create the article, or update it in place if the slug already exists
  // (idempotent — safe to re-run after editing the HTML draft).
  const fields = {
    status: "published" as const,
    category: "Film & Tech",
    cover_image: COVER_IMAGE,
    author_id: author.id,
    // English content on the base columns (the storefront falls back to these
    // for every locale until German/Italian translations are added).
    title:
      "Im Rausch der Sterne: The Best Supporting Role Is Played by a MULTIVAC Vacuum Machine",
    excerpt:
      "“Bradley Cooper wanted three stars. MULTIVAC just wanted a vacuum.” 😄",
    meta_title: "Im Rausch der Sterne: the MULTIVAC vacuum machine",
    meta_description:
      "The MULTIVAC vacuum machine in Im Rausch der Sterne (Burnt): professional chamber-vacuum tech on screen — and the MULTIVAC home that won an iF Design Award.",
    body,
  }

  const [existing] = await service.listArticles({ slug: SLUG }, { take: 1 })
  let article
  if (existing) {
    article = await service.updateArticles({ id: existing.id, ...fields })
    logger.info(`Updated article '${SLUG}' (${existing.id}) by ${author.name}`)
  } else {
    article = await service.createArticles({
      slug: SLUG,
      published_at: new Date(),
      ...fields,
    })
    logger.info(`Created article '${SLUG}' (${article.id}) by ${author.name}`)
  }
  logger.info(`View: /de/magazin/${SLUG}  and  /en/magazin/${SLUG}`)
}
