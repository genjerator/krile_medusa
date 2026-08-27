import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEO_METRICS_MODULE } from "../../modules/seoMetrics"
import { SEO_BRANDS, getSeoBrand, type SeoBrandConfig } from "./brands"
import { hasGoogleCreds } from "./google-auth"
import { fetchGa4Daily } from "./ga4"
import { fetchGscDailyMetrics, fetchGscQueries, fetchGscPages } from "./gsc"
import { fetchBingDailyMetrics, fetchBingQueries, fetchBingPages } from "./bing"

const isoDay = (d: Date) => d.toISOString().slice(0, 10)
const daysAgo = (n: number) => isoDay(new Date(Date.now() - n * 86_400_000))

export type IngestOptions = {
  brandKeys?: string[] // default: all configured brands
  days?: number // trailing window (default 30)
}

/**
 * Pulls GA4 + GSC + Bing for the configured brands and upserts into the
 * seoMetrics cache tables. Each (brand, source) is isolated in try/catch so one
 * failing property never blocks the rest. Upsert = delete the affected days then
 * insert, so re-pulling GSC's trailing lag window is idempotent.
 *
 * Mirrors the Brevo sync convention (a lib run by a scheduled job + an on-demand
 * admin route), rather than a workflow.
 */
export async function runSeoIngestion(
  container: MedusaContainer,
  opts: IngestOptions = {}
): Promise<{ brand: string; source: string; ok: boolean; error?: string }[]> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const svc: any = container.resolve(SEO_METRICS_MODULE)

  const days = opts.days ?? 30
  const startDate = daysAgo(days)
  const endDate = isoDay(new Date())
  const today = endDate

  const brands = (opts.brandKeys?.length
    ? opts.brandKeys.map(getSeoBrand).filter(Boolean)
    : SEO_BRANDS) as SeoBrandConfig[]

  const results: { brand: string; source: string; ok: boolean; error?: string }[] = []

  // Replace rows for the given brand/source/dates (delete-then-insert).
  const replaceMetrics = async (
    brand: string,
    source: string,
    rows: { date: string; metric_type: string; value: number }[]
  ) => {
    const dates = [...new Set(rows.map((r) => r.date))]
    if (dates.length) {
      const existing = await svc.listSeoMetricDailies(
        { brand, source, date: dates },
        { take: 1_000_000, select: ["id"] }
      )
      if (existing.length) await svc.deleteSeoMetricDailies(existing.map((e: any) => e.id))
    }
    if (rows.length) {
      await svc.createSeoMetricDailies(rows.map((r) => ({ brand, source, ...r })))
    }
  }

  const replaceQueries = async (brand: string, source: string, rows: any[]) => {
    const dates = [...new Set(rows.map((r) => r.date))]
    if (dates.length) {
      const existing = await svc.listSeoQueryDailies(
        { brand, source, date: dates },
        { take: 1_000_000, select: ["id"] }
      )
      if (existing.length) await svc.deleteSeoQueryDailies(existing.map((e: any) => e.id))
    }
    if (rows.length) await svc.createSeoQueryDailies(rows)
  }

  const replacePages = async (brand: string, source: string, rows: any[]) => {
    const dates = [...new Set(rows.map((r) => r.date))]
    if (dates.length) {
      const existing = await svc.listSeoPageDailies(
        { brand, source, date: dates },
        { take: 1_000_000, select: ["id"] }
      )
      if (existing.length) await svc.deleteSeoPageDailies(existing.map((e: any) => e.id))
    }
    if (rows.length) await svc.createSeoPageDailies(rows)
  }

  for (const brand of brands) {
    // ─── GA4 ──────────────────────────────────────────────────────────────────
    if (hasGoogleCreds() && brand.ga4_property_id) {
      try {
        const rows = await fetchGa4Daily(brand.ga4_property_id, startDate, endDate)
        await replaceMetrics(brand.key, "ga4", rows)
        results.push({ brand: brand.key, source: "ga4", ok: true })
      } catch (e: any) {
        logger.warn(`[seo-ingest] GA4 ${brand.key}: ${e.message}`)
        results.push({ brand: brand.key, source: "ga4", ok: false, error: e.message })
      }
    }

    // ─── GSC ──────────────────────────────────────────────────────────────────
    if (hasGoogleCreds() && brand.gsc_site) {
      try {
        const metrics = await fetchGscDailyMetrics(brand.gsc_site, startDate, endDate)
        await replaceMetrics(brand.key, "gsc", metrics)

        const queries = await fetchGscQueries(brand.gsc_site, startDate, endDate)
        await replaceQueries(
          brand.key,
          "gsc",
          queries.map((r) => ({
            brand: brand.key,
            source: "gsc",
            date: r.date,
            query: r.key,
            page: null,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position,
          }))
        )

        const pages = await fetchGscPages(brand.gsc_site, startDate, endDate)
        await replacePages(
          brand.key,
          "gsc",
          pages.map((r) => ({
            brand: brand.key,
            source: "gsc",
            date: r.date,
            page: r.key,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position,
          }))
        )
        results.push({ brand: brand.key, source: "gsc", ok: true })
      } catch (e: any) {
        logger.warn(`[seo-ingest] GSC ${brand.key}: ${e.message}`)
        results.push({ brand: brand.key, source: "gsc", ok: false, error: e.message })
      }
    }

    // ─── Bing (optional; key is per-brand / account-scoped) ─────────────────────
    if (brand.bing_api_key && brand.bing_site) {
      try {
        const metrics = await fetchBingDailyMetrics(brand.bing_site, brand.bing_api_key)
        await replaceMetrics(brand.key, "bing", metrics)

        const ctr = (c: number, i: number) => (i > 0 ? c / i : 0)
        const queries = await fetchBingQueries(brand.bing_site, brand.bing_api_key)
        await replaceQueries(
          brand.key,
          "bing",
          queries.map((r) => ({
            brand: brand.key,
            source: "bing",
            date: today, // rolling aggregate → snapshot against today
            query: r.key,
            page: null,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: ctr(r.clicks, r.impressions),
            position: r.position,
          }))
        )

        const pages = await fetchBingPages(brand.bing_site, brand.bing_api_key)
        await replacePages(
          brand.key,
          "bing",
          pages.map((r) => ({
            brand: brand.key,
            source: "bing",
            date: today,
            page: r.key,
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: ctr(r.clicks, r.impressions),
            position: r.position,
          }))
        )
        results.push({ brand: brand.key, source: "bing", ok: true })
      } catch (e: any) {
        logger.warn(`[seo-ingest] Bing ${brand.key}: ${e.message}`)
        results.push({ brand: brand.key, source: "bing", ok: false, error: e.message })
      }
    }
  }

  logger.info(
    `[seo-ingest] done: ${results.filter((r) => r.ok).length}/${results.length} source pulls ok`
  )
  return results
}
