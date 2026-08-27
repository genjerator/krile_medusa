import { model } from "@medusajs/framework/utils"

/**
 * One daily overview metric per brand + source. This is the KPI time-series that
 * powers the cards and trend charts (GA4 users/sessions, GSC clicks/impressions/
 * CTR/position, Bing clicks/impressions). Kept as a long/narrow table so new
 * metric types don't need schema changes.
 *
 * Idempotency: on ingest we delete existing rows for (brand, source, date) and
 * re-insert, so re-pulling GSC's trailing lag window is safe.
 */
const SeoMetricDaily = model.define("seo_metric_daily", {
  id: model.id().primaryKey(),
  brand: model.text(), // "industries" | "planeta"
  source: model.enum(["ga4", "gsc", "bing"]),
  date: model.text(), // ISO day "YYYY-MM-DD"
  metric_type: model.text(), // users | new_users | sessions | clicks | impressions | ctr | position | ...
  value: model.float(),
})

export default SeoMetricDaily
