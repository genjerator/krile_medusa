import path from "path"
import fs from "fs"
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

interface CategoryEntry {
  handle: string
  name: string
  is_active: boolean
  is_internal: boolean
  parent_handle: string | null
  woo_term_id: number
  woo_parent_id: number
}

export default async function seedPlanetaCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("🚀 Starting Planeta category seed...")

  // ─── LOAD DATA ────────────────────────────────────────────────────────────
  const jsonPath = path.resolve(process.cwd(), "../mysql/woo-exporter/categories.json")
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`categories.json not found at: ${jsonPath}`)
  }
  const categories: CategoryEntry[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
  logger.info(`  Loaded ${categories.length} categories from categories.json`)

  // ─── UPSERT ───────────────────────────────────────────────────────────────
  // JSON is sorted parents-first so we can resolve parent IDs in a single pass
  const handleToId = new Map<string, string>()

  for (const cat of categories) {
    const parentId = cat.parent_handle ? handleToId.get(cat.parent_handle) : undefined

    const existing = await productModule.listProductCategories({ handle: [cat.handle] })

    if (existing[0]) {
      await productModule.updateProductCategories(existing[0].id, {
        name: cat.name,
        is_active: cat.is_active,
        is_internal: cat.is_internal,
        ...(parentId && { parent_category_id: parentId }),
      })
      handleToId.set(cat.handle, existing[0].id)
      logger.info(`  ↺ updated:  ${cat.name}`)
    } else {
      const [created] = await productModule.createProductCategories([{
        name: cat.name,
        handle: cat.handle,
        is_active: cat.is_active,
        is_internal: cat.is_internal,
        ...(parentId && { parent_category_id: parentId }),
      }])
      handleToId.set(cat.handle, created.id)
      logger.info(`  ✓ created:  ${cat.name}`)
    }
  }

  logger.info(`✅ Planeta category seed complete! (${categories.length} categories upserted)`)
}
