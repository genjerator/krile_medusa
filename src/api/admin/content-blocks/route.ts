import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTENT_BLOCK_MODULE } from "../../../modules/contentBlock"

/**
 * GET  /admin/content-blocks        — list all blocks (admin editor list view)
 * POST /admin/content-blocks        — create a block { key, title?, status? }
 *
 * Reusable static content addressed by `key`. Body copy (de/en/it) is edited
 * per-block via /admin/content-blocks/:id. Following the storefrontBranding
 * convention, routes call the module service directly (simple CRUD, no
 * cross-module workflow needed).
 */

const slugify = (v: string) =>
  v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  const blocks = await service.listContentBlocks({}, { order: { key: "ASC" } })
  res.json({ content_blocks: blocks })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service: any = req.scope.resolve(CONTENT_BLOCK_MODULE)
  const body = (req.body ?? {}) as Record<string, unknown>

  const key = slugify(typeof body.key === "string" ? body.key : "")
  if (!key) {
    return res.status(400).json({ message: "A non-empty 'key' is required." })
  }

  const [existing] = await service.listContentBlocks({ key }, { take: 1 })
  if (existing) {
    return res.status(409).json({ message: `A content block with key '${key}' already exists.` })
  }

  const title = typeof body.title === "string" && body.title.trim() !== "" ? body.title.trim() : null
  const status = body.status === "draft" ? "draft" : "published"

  const block = await service.createContentBlocks({ key, title, status })
  res.json({ content_block: block })
}
