import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_BLOCK_MODULE } from "../../../../modules/contentBlock"

/**
 * GET    /admin/content-blocks/:id   — read one block (all locales)
 * POST   /admin/content-blocks/:id   — update { title?, status?, body?, body_en?, body_it? }
 * DELETE /admin/content-blocks/:id   — remove a block
 *
 * Only the fields present in the body are updated (partial update). Empty
 * strings are stored as null so the storefront falls back to German.
 */

// Editable per-locale HTML columns + scalar fields.
const HTML_FIELDS = ["body", "body_en", "body_it"] as const
const TEXT_FIELDS = ["title"] as const

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  const block = await service.retrieveContentBlock(req.params.id).catch(() => null)
  if (!block) {
    return res.status(404).json({ message: "Content block not found." })
  }
  res.json({ content_block: block })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  const id = req.params.id
  const body = (req.body ?? {}) as Record<string, unknown>

  const existing = await service.retrieveContentBlock(id).catch(() => null)
  if (!existing) {
    return res.status(404).json({ message: "Content block not found." })
  }

  const patch: Record<string, string | null> = {}
  for (const f of [...HTML_FIELDS, ...TEXT_FIELDS]) {
    if (f in body) {
      const v = body[f]
      patch[f] = typeof v === "string" && v.trim() !== "" ? v : null
    }
  }
  if ("status" in body) {
    patch.status = body.status === "draft" ? "draft" : "published"
  }

  const block = await service.updateContentBlocks({ id, ...patch })
  res.json({ content_block: block })
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  await service.deleteContentBlocks(req.params.id)
  res.json({ id: req.params.id, object: "content_block", deleted: true })
}
