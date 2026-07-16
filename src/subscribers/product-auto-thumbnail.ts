import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Whenever a product is created or its media changes, set the thumbnail to
 * the first gallery image if no thumbnail is set. Never overwrites a
 * manually chosen thumbnail.
 */
export default async function productAutoThumbnailHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    filters: { id: data.id },
    fields: ["id", "title", "thumbnail", "images.url", "images.rank"],
  })

  if (!product || product.thumbnail || !product.images?.length) {
    return
  }

  const firstImage = [...product.images].sort(
    (a, b) => (a?.rank ?? 0) - (b?.rank ?? 0)
  )[0]

  if (!firstImage?.url) {
    return
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: [{ id: product.id, thumbnail: firstImage.url }],
    },
  })

  logger.info(
    `[auto-thumbnail] Set thumbnail for "${product.title}" (${product.id}) to first image`
  )
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
