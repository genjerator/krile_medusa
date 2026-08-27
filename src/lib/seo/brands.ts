/**
 * SEO dashboard brand configuration, read from env so no secrets/IDs are in code.
 * Two brands mirror the storefronts (same keys as store-email-identity):
 *   - "industries" → planetaindustries.de
 *   - "planeta"    → planeta.de (Planeta GmbH shop)
 *
 * Env contract (per brand, UPPERCASE key):
 *   SEO_INDUSTRIES_GA4_PROPERTY_ID = 123456789        (GA4 numeric property id)
 *   SEO_INDUSTRIES_GSC_SITE        = sc-domain:planetaindustries.de   (or https URL)
 *   SEO_INDUSTRIES_BING_SITE       = https://www.planetaindustries.de/
 *   SEO_PLANETA_GA4_PROPERTY_ID    = ...
 *   SEO_PLANETA_GSC_SITE           = ...
 *   SEO_PLANETA_BING_SITE          = ...
 * Shared:
 *   SEO_GOOGLE_SA_JSON = <service-account JSON, raw or base64>   (GA4 + GSC)
 *   SEO_BING_API_KEY   = <Bing Webmaster API key>                (optional; Bing skipped if unset)
 *
 * The storefront base URLs are used to map a GSC/Bing page URL back to a Medusa
 * product/category handle for the revenue join.
 */

export type SeoBrandKey = "industries" | "planeta"

export type SeoBrandConfig = {
  key: SeoBrandKey
  label: string
  site_url: string // canonical storefront origin, for URL→handle mapping
  ga4_property_id?: string
  gsc_site?: string
  bing_site?: string
  bing_api_key?: string
}

const brand = (
  key: SeoBrandKey,
  label: string,
  site_url: string,
  envPrefix: string
): SeoBrandConfig => ({
  key,
  label,
  site_url,
  ga4_property_id: process.env[`${envPrefix}_GA4_PROPERTY_ID`] || undefined,
  gsc_site: process.env[`${envPrefix}_GSC_SITE`] || undefined,
  bing_site: process.env[`${envPrefix}_BING_SITE`] || undefined,
  // Bing keys are account-scoped: a per-brand key wins, else the shared key.
  bing_api_key:
    process.env[`${envPrefix}_BING_API_KEY`] || process.env.SEO_BING_API_KEY || undefined,
})

export const SEO_BRANDS: SeoBrandConfig[] = [
  brand("industries", "Planeta Industries", "https://www.planetaindustries.de", "SEO_INDUSTRIES"),
  brand("planeta", "Planeta GmbH", "https://www.planeta.de", "SEO_PLANETA"),
]

export const getSeoBrand = (key: string): SeoBrandConfig | undefined =>
  SEO_BRANDS.find((b) => b.key === key)

/** True when Bing is configured for at least one brand (for the admin toggle). */
export const bingConfigured = () => SEO_BRANDS.some((b) => b.bing_api_key && b.bing_site)
