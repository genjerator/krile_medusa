import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { revalidateStorefronts } from "../lib/revalidate"

export default async function productUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] product event: ${name} id=${(data as any)?.id}`)
  await revalidateStorefronts("products,collections,categories")
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    // Editing a variant's price in the admin runs updateProductVariantsWorkflow,
    // which emits product-variant.* — NOT product.updated — so without these a
    // price change would not clear the storefront cache the way a title/
    // description edit (product.updated) does.
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product-media.created",
    "product-media.updated",
    "product-media.deleted",
    "sales-channel.created",
    "sales-channel.updated",
    "sales-channel.deleted",
  ],
}
