import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

async function revalidate(tags: string) {
  const url = process.env.STOREFRONT_URL
  if (!url) {
    console.log("[revalidate] STOREFRONT_URL not set — skipping")
    return
  }
  console.log(`[revalidate] → ${url}/api/revalidate?tags=${tags}`)
  const res = await fetch(`${url}/api/revalidate?tags=${tags}`).catch(
    (e) => { console.error("[revalidate] fetch failed:", e.message); return null }
  )
  if (res) console.log(`[revalidate] ← status ${res.status}`)
}

export default async function productUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] product event: ${name} id=${data.id}`)
  await revalidate("products,collections,categories")
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-media.created",
    "product-media.updated",
    "product-media.deleted",
  ],
}
