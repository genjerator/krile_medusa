/**
 * Weekly-action email generator (CLI).
 *
 * Builds the ready-to-send HTML email for the currently admin-activated weekly
 * action and writes it to `wochenaktion.html` (next to this file). It shares the
 * exact template with the admin "Download email HTML" button via `render.ts`.
 *
 * It uses the SAME data path as the storefront's /de/weekly-actions page — it
 * does NOT scrape the rendered page:
 *   1) GET /store/regions        → resolve the region for the country (prices)
 *   2) GET /store/weekly-action  → the active campaign + its product ids
 *   3) GET /store/products       → each product's title/handle/image and its
 *                                  was/now price (calculated_price) for the region
 *
 * Run (needs the backend on WEEKLY_BACKEND_URL):
 *   npx tsx src/lib/email-templates/weekly-action/generate.mts
 *
 * Config via env vars (all optional):
 *   WEEKLY_BACKEND_URL      Medusa backend base URL        (default http://localhost:9000)
 *   WEEKLY_STOREFRONT_URL   base for product links         (default https://www.planeta.de)
 *   WEEKLY_COUNTRY          country code for pricing/links (default de)
 *   WEEKLY_PUBLISHABLE_KEY  Medusa publishable API key     (default: read from the
 *                           planetagmbh_medusa-storefront/.env(.local) sibling)
 *   WEEKLY_OUT              output file path               (default: ./wochenaktion.html)
 *   WEEKLY_LOGO_URL         header logo URL                (default www.planeta.de/planeta_logo_blue.png)
 */

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { renderWeeklyActionEmail, type WeeklyEmailProduct } from "./render.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ──────────────────────────────────────────────────────────────────
const BACKEND_URL = (process.env.WEEKLY_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "")
const STOREFRONT_URL = (process.env.WEEKLY_STOREFRONT_URL || "https://www.planeta.de").replace(/\/$/, "")
const COUNTRY = (process.env.WEEKLY_COUNTRY || "de").toLowerCase()
const LOCALE = COUNTRY
const OUT = process.env.WEEKLY_OUT || resolve(__dirname, "wochenaktion.html")
const LOGO_URL = process.env.WEEKLY_LOGO_URL || "https://www.planeta.de/planeta_logo_blue.png"

/** Read the publishable key from env, else from the sibling storefront .env. */
function resolvePublishableKey(): string {
  if (process.env.WEEKLY_PUBLISHABLE_KEY) return process.env.WEEKLY_PUBLISHABLE_KEY.trim()
  const candidates = [
    resolve(__dirname, "../../../../../planetagmbh_medusa-storefront/.env.local"),
    resolve(__dirname, "../../../../../planetagmbh_medusa-storefront/.env"),
    resolve(__dirname, "../../../../../krile_medusa-storefront/.env.local"),
    resolve(__dirname, "../../../../../krile_medusa-storefront/.env"),
  ]
  for (const file of candidates) {
    try {
      const env = readFileSync(file, "utf8")
      const m = env.match(/^\s*NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY\s*=\s*(.+)\s*$/m)
      if (m) return m[1].trim().replace(/^["']|["']$/g, "")
    } catch {
      /* try next */
    }
  }
  throw new Error(
    "No publishable key. Set WEEKLY_PUBLISHABLE_KEY, or ensure planetagmbh_medusa-storefront/.env(.local) has NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY."
  )
}

const PUBLISHABLE_KEY = resolvePublishableKey()
const headers = { "x-publishable-api-key": PUBLISHABLE_KEY }

// ── Helpers ───────────────────────────────────────────────────────────────
async function api<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`GET ${path} → ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 300)}` : ""}`)
  }
  return res.json() as Promise<T>
}

/** Map a product's cheapest priced variant to the email's was/now shape. */
function toEmailProduct(product: any): WeeklyEmailProduct | null {
  const priced = (product.variants || [])
    .map((v: any) => v.calculated_price)
    .filter((p: any) => p && p.calculated_amount != null)
  if (!priced.length) return null
  priced.sort((a: any, b: any) => a.calculated_amount - b.calculated_amount)
  const p = priced[0]
  const now = Number(p.calculated_amount)
  const was = Number(p.original_amount ?? p.calculated_amount)
  const pct = was > now ? Math.round((1 - now / was) * 100) : 0
  return {
    title: product.title ?? product.id,
    handle: product.handle ?? "",
    image: product.thumbnail ?? product.images?.[0]?.url ?? "",
    was,
    now,
    pct,
    currency: p.currency_code,
  }
}

async function resolveRegion(): Promise<any> {
  const { regions } = await api<{ regions: any[] }>(`/store/regions?fields=id,currency_code,*countries&limit=100`)
  const match = (regions || []).find((r) =>
    (r.countries || []).some((c: any) => String(c.iso_2).toLowerCase() === COUNTRY)
  )
  const region = match || (regions || [])[0]
  if (!region) throw new Error("No regions configured on the backend.")
  return region
}

async function fetchProducts(ids: string[], regionId: string): Promise<any[]> {
  if (!ids.length) return []
  const params = new URLSearchParams()
  ids.forEach((id) => params.append("id[]", id))
  params.set("region_id", regionId)
  params.set("limit", String(ids.length))
  params.set("fields", "id,title,handle,thumbnail,images.url,*variants.calculated_price")
  const { products } = await api<{ products: any[] }>(`/store/products?${params.toString()}`)
  const byId = new Map((products || []).map((p) => [p.id, p]))
  return ids.map((id) => byId.get(id)).filter(Boolean) // preserve campaign order
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`→ backend:    ${BACKEND_URL}`)
  console.log(`→ storefront: ${STOREFRONT_URL}  (country=${COUNTRY})`)

  const region = await resolveRegion()
  const { weekly_action, product_ids } = await api<{ weekly_action: any; product_ids: string[] }>(
    `/store/weekly-action`
  )
  if (!weekly_action || !product_ids?.length) {
    throw new Error(
      "No active weekly action found. Activate a campaign in the admin (Weekly Actions → toggle active) and retry."
    )
  }

  const products = (await fetchProducts(product_ids, region.id))
    .map(toEmailProduct)
    .filter((p): p is WeeklyEmailProduct => !!p)
  if (!products.length) throw new Error("The active weekly action has no resolvable products.")

  const html = renderWeeklyActionEmail({
    weeklyAction: { title: weekly_action.title, ends_at: weekly_action.ends_at },
    products,
    storefrontUrl: STOREFRONT_URL,
    locale: LOCALE,
    country: COUNTRY,
    logoUrl: LOGO_URL,
  })
  writeFileSync(OUT, html, "utf8")

  console.log(`✓ ${products.length} product(s): ${products.map((p) => p.title).join(", ")}`)
  console.log(`✓ wrote ${OUT}`)
}

main().catch((e) => {
  console.error(`✗ ${e.message}`)
  process.exit(1)
})
