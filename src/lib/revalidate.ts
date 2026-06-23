/**
 * Pings the `/api/revalidate` endpoint of every configured storefront so that
 * on-demand ISR clears the cache for the given comma-separated `tags`.
 *
 * This backend serves BOTH storefronts (krile + planeta), so it reads a
 * comma-separated `STOREFRONT_URLS` and falls back to the single
 * `STOREFRONT_URL` for backwards compatibility.
 */
export async function revalidateStorefronts(tags: string) {
  const raw = process.env.STOREFRONT_URLS || process.env.STOREFRONT_URL || ""
  const urls = raw.split(",").map((u) => u.trim()).filter(Boolean)

  if (urls.length === 0) {
    console.log("[revalidate] no STOREFRONT_URLS / STOREFRONT_URL set — skipping")
    return
  }

  await Promise.all(
    urls.map(async (url) => {
      const endpoint = `${url}/api/revalidate?tags=${tags}`
      console.log(`[revalidate] → ${endpoint}`)
      const res = await fetch(endpoint).catch((e) => {
        console.error(`[revalidate] fetch failed for ${url}:`, e.message)
        return null
      })
      if (res) console.log(`[revalidate] ← ${url} status ${res.status}`)
    })
  )
}
