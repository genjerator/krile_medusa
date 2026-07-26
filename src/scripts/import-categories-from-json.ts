import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { readFileSync } from "fs"
import path from "path"

/**
 * Imports a nested category tree from a JSON file into Medusa. Idempotent:
 * upsert by handle (existing categories are updated, not duplicated). Parents
 * are created first, then children linked via parent_category_id.
 *
 * JSON shape (see src/scripts/imports/pacovis-categories.json):
 *   [{ name, handle, is_active?, is_internal?, rank?, description?,
 *      category_children: [{ name, handle, ... }] }]
 *
 * Run:
 *   local — npx medusa exec ./src/scripts/import-categories-from-json.ts
 *   prod  — ssh ... "docker exec app-medusa-1 sh -c 'REDIS_URL= pnpm medusa exec ./src/scripts/import-categories-from-json.js'"
 */

type CatNode = {
  name: string
  handle: string
  is_active?: boolean
  is_internal?: boolean
  rank?: number
  description?: string
  category_children?: CatNode[]
}

const DATA_FILE = "imports/pacovis-categories.json"

export default async function importCategoriesFromJson({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: IProductModuleService = container.resolve(Modules.PRODUCT)

  // JS is emitted to .medusa/server/src/scripts; the JSON sits next to the TS
  // source. Try the source-relative path first, then the compiled location.
  const candidates = [
    path.resolve(process.cwd(), "src/scripts", DATA_FILE),
    path.resolve(__dirname, DATA_FILE),
  ]
  const filePath = candidates.find((p) => {
    try { readFileSync(p); return true } catch { return false }
  })
  if (!filePath) {
    logger.error(`❌ Could not find ${DATA_FILE} in: ${candidates.join(", ")}`)
    return
  }

  const tree: CatNode[] = JSON.parse(readFileSync(filePath, "utf-8"))
  logger.info(`🚀 Importing ${tree.length} top-level categories from ${filePath}`)

  let created = 0
  let updated = 0

  const upsert = async (node: CatNode, parentId: string | null): Promise<string> => {
    const [existing] = await productModule.listProductCategories({ handle: [node.handle] })
    // Only send fields that are actually specified, so re-running never nulls a
    // field (e.g. a description/rank set elsewhere) that the JSON omits.
    const payload: Record<string, unknown> = { parent_category_id: parentId }
    if (node.name !== undefined) payload.name = node.name
    payload.handle = node.handle
    if (node.is_active !== undefined) payload.is_active = node.is_active
    if (node.is_internal !== undefined) payload.is_internal = node.is_internal
    if (node.rank !== undefined) payload.rank = node.rank
    if (node.description !== undefined) payload.description = node.description

    let id: string
    if (existing) {
      await productModule.updateProductCategories({ id: existing.id }, payload)
      id = existing.id
      updated++
      logger.info(`  ↻ updated  ${node.handle}`)
    } else {
      const [row] = await productModule.createProductCategories([payload as any])
      id = row.id
      created++
      logger.info(`  ＋ created  ${node.handle}`)
    }

    // Recurse into children (arbitrary depth), linking them to this node.
    for (const child of node.category_children ?? []) {
      await upsert(child, id)
    }
    return id
  }

  for (const root of tree) {
    await upsert(root, null)
  }

  logger.info(`✅ Done — ${created} created, ${updated} updated.`)
}
