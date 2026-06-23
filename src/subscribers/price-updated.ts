import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { revalidateStorefronts } from "../lib/revalidate"

export default async function priceUpdatedHandler({
  event: { name },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] price event: ${name}`)
  await revalidateStorefronts("products")
}

export const config: SubscriberConfig = {
  event: ["price-set.updated", "price-set.created", "price-set.deleted"],
}
