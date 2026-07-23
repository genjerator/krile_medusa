import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/products/export-csv?sales_channel_id=
 *
 * Exports products as a CSV (name, id, sku, description, handle, subtitle,
 * storefront link, category). Optionally scoped to one sales channel — feeds
 * the "Export CSV" button on the Products by Channel admin page.
 */

// Keep in sync with the Products-by-Channel page's storefront mapping.
const STOREFRONT_BY_CHANNEL: Record<string, string> = {
  IndustriesWebshop: "https://www.planetaindustries.de",
  PlanetaWebshop: "https://www.planeta.de",
}
const DEFAULT_STOREFRONT = "https://www.planetaindustries.de"

const storefrontUrl = (
  channels: Array<{ name: string }> | undefined,
  handle: string | null
): string => {
  if (!handle) return ""
  let base = DEFAULT_STOREFRONT
  for (const ch of channels ?? []) {
    if (STOREFRONT_BY_CHANNEL[ch.name]) {
      base = STOREFRONT_BY_CHANNEL[ch.name]
      break
    }
  }
  return `${base}/de/products/${handle}`
}

// Top-level category name (parent if the product is only in a subcategory).
const topCategory = (
  categories: Array<{ name: string; parent_category_id: string | null; parent_category?: { name: string } | null }> | undefined
): string => {
  if (!categories?.length) return ""
  const withoutParent = categories.filter((c) => !c.parent_category_id)
  if (withoutParent.length) return withoutParent[0].name
  const leaf = categories[0]
  return leaf.parent_category?.name ?? leaf.name
}

const COLUMNS = ["Name", "ID", "SKU", "Description", "Handle", "Subtitle", "Storefront Link", "Category"]

/** RFC-4180 field: quote when it contains a comma, quote, CR or LF; double inner quotes. */
const escapeCsv = (value: unknown): string => {
  const s = value === null || value === undefined ? "" : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const scId = typeof req.query.sales_channel_id === "string" ? req.query.sales_channel_id : ""

  const take = 200
  let skip = 0
  const rows: any[] = []
  for (;;) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "subtitle", "description", "handle",
        "variants.sku",
        "categories.name", "categories.parent_category_id", "categories.parent_category.name",
        "sales_channels.id", "sales_channels.name",
      ],
      pagination: { take, skip, order: { created_at: "DESC" } } as any,
    })
    const page = data as any[]
    for (const p of page) {
      // Channel filter applied in-memory (product ↔ sales_channel is a link).
      if (scId && !(p.sales_channels ?? []).some((c: any) => c.id === scId)) continue
      rows.push(p)
    }
    if (page.length < take) break
    skip += take
  }

  const header = COLUMNS.map(escapeCsv).join(",")
  const body = rows
    .map((p) => {
      const sku = (p.variants ?? []).map((v: any) => v.sku).filter(Boolean).join(" | ")
      return [
        p.title,
        p.id,
        sku,
        p.description,
        p.handle,
        p.subtitle,
        storefrontUrl(p.sales_channels, p.handle),
        topCategory(p.categories),
      ]
        .map(escapeCsv)
        .join(",")
    })
    .join("\r\n")
  // Leading BOM => Excel opens it as UTF-8 (correct umlauts).
  const csv = `﻿${header}\r\n${body}\r\n`

  const filename = `products-${new Date().toISOString().slice(0, 10)}.csv`
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
  return res.send(csv)
}
