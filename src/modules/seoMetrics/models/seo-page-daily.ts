import { model } from "@medusajs/framework/utils"

/**
 * Top landing pages per brand + source + day (GSC and Bing). Two jobs:
 *  - the top-pages table, and
 *  - the commerce join (the differentiator): `page` URL → Medusa product/category
 *    handle → orders/revenue, so organic clicks sit next to revenue per product.
 *
 * Idempotency: delete + re-insert per (brand, source, date) on ingest.
 */
const SeoPageDaily = model.define("seo_page_daily", {
  id: model.id().primaryKey(),
  brand: model.text(),
  source: model.enum(["gsc", "bing"]),
  date: model.text(), // "YYYY-MM-DD"
  page: model.text(), // full landing URL
  clicks: model.float().default(0),
  impressions: model.float().default(0),
  ctr: model.float().default(0), // 0..1
  position: model.float().nullable(),
})

export default SeoPageDaily
