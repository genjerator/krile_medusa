import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { revalidateStorefronts } from "../lib/revalidate"

export default async function collectionUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] collection event: ${name} id=${data.id}`)
  // A collection change (e.g. renamed, or products added/removed) affects both
  // the collection listings and the products shown in them, so refresh both.
  await revalidateStorefronts("collections,products")
}

export const config: SubscriberConfig = {
  event: [
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
  ],
}
