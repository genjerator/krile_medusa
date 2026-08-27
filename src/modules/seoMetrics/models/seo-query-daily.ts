import { model } from "@medusajs/framework/utils"

/**
 * Top search queries per brand + source + day (GSC and Bing). Feeds the
 * top-queries table and the "movers" panel. `page` is the landing URL the query
 * drove traffic to (present when we pull the query×page dimension), else null.
 *
 * Idempotency: delete + re-insert per (brand, source, date) on ingest.
 */
const SeoQueryDaily = model.define("seo_query_daily", {
  id: model.id().primaryKey(),
  brand: model.text(),
  source: model.enum(["gsc", "bing"]),
  date: model.text(), // "YYYY-MM-DD"
  query: model.text(),
  page: model.text().nullable(),
  clicks: model.float().default(0),
  impressions: model.float().default(0),
  ctr: model.float().default(0), // 0..1
  position: model.float().nullable(),
})

export default SeoQueryDaily
