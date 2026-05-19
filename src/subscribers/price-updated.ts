import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

async function revalidate(tags: string) {
  const url = process.env.STOREFRONT_URL
  if (!url) return
  console.log(`[revalidate] → ${url}/api/revalidate?tags=${tags}`)
  const res = await fetch(`${url}/api/revalidate?tags=${tags}`).catch(
    (e) => { console.error("[revalidate] fetch failed:", e.message); return null }
  )
  if (res) console.log(`[revalidate] ← status ${res.status}`)
}

export default async function priceUpdatedHandler({
  event: { name },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] price event: ${name}`)
  await revalidate("products")
}

export const config: SubscriberConfig = {
  event: ["price-set.updated", "price-set.created", "price-set.deleted"],
}
