import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ARTICLE_MODULE } from "../modules/article"

/**
 * Repoint article cover images from storefront-relative paths to absolute S3
 * URLs, so the one image in S3 renders on every storefront (planeta.de and
 * planetaindustries.de) instead of each storefront needing its own copy under
 * public/magazin/.
 *
 * Only touches covers that are a relative "/magazin/..." path; absolute URLs
 * (http...) are left as-is, so it is safe to re-run (idempotent).
 *
 * Prerequisite: the image files must already exist in S3 under magazin/
 * (upload them first — see the client/dev notes).
 *
 * Run: npx medusa exec ./src/scripts/repoint-magazin-covers-to-s3.ts
 */

// Public S3 base (bucket policy allows public GetObject). Mirrors S3_FILE_URL.
const S3_BASE =
  process.env.S3_FILE_URL ??
  "https://krile-medusa-313003894447-eu-central-1-an.s3.eu-central-1.amazonaws.com"

export default async function repointMagazinCovers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const articleService: any = container.resolve(ARTICLE_MODULE)

  const articles: any[] = await articleService.listArticles(
    {},
    { take: 100_000, select: ["id", "slug", "cover_image"] }
  )

  const toFix = articles.filter(
    (a) => typeof a.cover_image === "string" && a.cover_image.startsWith("/magazin/")
  )

  if (!toFix.length) {
    logger.info("[repoint-magazin-covers] nothing to repoint — all covers already absolute.")
    return
  }

  logger.info(`[repoint-magazin-covers] repointing ${toFix.length} cover(s) to S3…`)
  for (const a of toFix) {
    const next = `${S3_BASE.replace(/\/$/, "")}${a.cover_image}`
    await articleService.updateArticles({ id: a.id, cover_image: next })
    logger.info(`  ${a.slug}: ${a.cover_image} -> ${next}`)
  }
  logger.info(`[repoint-magazin-covers] done (${toFix.length} updated).`)
}
