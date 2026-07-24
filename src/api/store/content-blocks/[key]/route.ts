import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_BLOCK_MODULE } from "../../../../modules/contentBlock"

/**
 * GET /store/content-blocks/:key?locale=de|en|it
 *
 * Returns a single published content block resolved for the requested locale,
 * falling back to German when a locale's body is empty. Public (needs a valid
 * publishable key like all /store routes).
 */

const LOCALE_COLUMN: Record<string, "body" | "body_en" | "body_it"> = {
  de: "body",
  en: "body_en",
  it: "body_it",
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  const key = req.params.key

  const [block] = await service.listContentBlocks({ key, status: "published" }, { take: 1 })
  if (!block) {
    return res.status(404).json({ content_block: null })
  }

  const localeParam = (req.query.locale as string | undefined)?.slice(0, 2).toLowerCase() ?? "de"
  const column = LOCALE_COLUMN[localeParam] ?? "body"
  // Fall back to German when the requested locale has no content.
  const bodyHtml = (block[column] as string | null) || (block.body as string | null) || ""

  res.json({
    content_block: {
      key: block.key,
      title: block.title,
      body: bodyHtml,
    },
  })
}
