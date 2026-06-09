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

export default async function categoryUpdatedHandler({
  event: { name, data },
}: SubscriberArgs<{ id: string }>) {
  console.log(`[subscriber] category event: ${name} id=${data.id}`)
  await revalidate("categories")
}

export const config: SubscriberConfig = {
  event: [
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
