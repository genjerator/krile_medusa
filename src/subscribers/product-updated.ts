import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { revalidateStorefronts } from "../lib/revalidate"

export default async function productUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] product event: ${name} id=${data.id}`)
  await revalidateStorefronts("products,collections,categories")
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-media.created",
    "product-media.updated",
    "product-media.deleted",
    "sales-channel.created",
    "sales-channel.updated",
    "sales-channel.deleted",
  ],
}
