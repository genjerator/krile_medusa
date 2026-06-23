import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { revalidateStorefronts } from "../lib/revalidate"

export default async function categoryUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] category event: ${name} id=${data.id}`)
  // A category change can move products in/out of listings, so refresh both.
  await revalidateStorefronts("categories,products")
}

export const config: SubscriberConfig = {
  event: [
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
