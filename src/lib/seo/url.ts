/**
 * Map a storefront URL (as reported by GSC/Bing) back to a Medusa catalog handle.
 * Storefront routes are locale-prefixed:
 *   /{countryCode}/product/{handle}        → product
 *   /{countryCode}/categories/{...handle}  → category (last segment)
 * Query strings, trailing slashes and the locale segment are stripped.
 */
export type PageHandle = { type: "product" | "category" | "other"; handle: string | null }

export function pageToHandle(pageUrl: string): PageHandle {
  let path: string
  try {
    path = new URL(pageUrl).pathname
  } catch {
    path = pageUrl
  }
  const segments = path.split("/").filter(Boolean)

  const pIdx = segments.indexOf("product")
  if (pIdx !== -1 && segments[pIdx + 1]) {
    return { type: "product", handle: decodeURIComponent(segments[pIdx + 1]) }
  }

  const cIdx = segments.indexOf("categories")
  if (cIdx !== -1 && segments.length > cIdx + 1) {
    return { type: "category", handle: decodeURIComponent(segments[segments.length - 1]) }
  }

  return { type: "other", handle: null }
}
