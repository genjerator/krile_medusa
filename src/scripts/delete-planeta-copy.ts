import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/core-flows"

/**
 * One-off: remove the accidental duplicate product
 * "Copy of Blau gemustert - Gummizug"
 * (handle planeta-blau-gemustert-gummizug-1805-copy-1781779197189).
 *
 * Soft-deletes via the core workflow so domain events fire (search reindex etc.).
 *
 * Local: pnpm medusa exec ./src/scripts/delete-planeta-copy.ts
 */
const HANDLE = "planeta-blau-gemustert-gummizug-1805-copy-1781779197189"

export default async function deletePlanetaCopy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule: any = container.resolve(Modules.PRODUCT)

  const [product] = await productModule.listProducts(
    { handle: HANDLE },
    { select: ["id", "title", "handle"], take: 1 }
  )

  if (!product) {
    logger.warn(`No product found for handle "${HANDLE}" — nothing to delete.`)
    console.log("DELETE-PLANETA-COPY DONE: deleted=0 (not found)")
    return
  }

  await deleteProductsWorkflow(container).run({ input: { ids: [product.id] } })
  logger.info(`✓ deleted ${product.handle} (${product.id}) — "${product.title}"`)
  console.log("DELETE-PLANETA-COPY DONE: deleted=1")
}
