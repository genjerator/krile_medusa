/**
 * Locale resolution for the Article/Magazin module. Mirrors the contentBlock
 * convention: German lives on the base column, English/Italian on `_en`/`_it`,
 * with fallback to German when a locale is empty.
 */

export type Locale = "de" | "en" | "it"

export const toLocale = (v?: unknown): Locale => {
  const l = (typeof v === "string" ? v : "de").slice(0, 2).toLowerCase()
  return l === "en" || l === "it" ? l : "de"
}

/**
 * Resolve the content locale for a store request. NOTE: the core translation
 * feature flag (MEDUSA_FF_TRANSLATION) consumes the `locale` query param, so we
 * read our own `lang` query param, falling back to the `x-medusa-locale` header
 * that the storefront SDK sends automatically.
 */
export const reqLocale = (req: any): Locale =>
  toLocale(req?.query?.lang ?? req?.headers?.["x-medusa-locale"])

/**
 * Sales-channel scope for a store request: articles are visible when they have
 * no channel (global) OR belong to one of the publishable key's sales channels.
 * Returns `{}` when the request has no channel context (show all).
 */
export const channelScope = (req: any): Record<string, any> => {
  const ids: string[] = req?.publishable_key_context?.sales_channel_ids ?? []
  if (!Array.isArray(ids) || ids.length === 0) return {}
  return { $or: [{ sales_channel_id: null }, { sales_channel_id: ids }] }
}

const pick = (o: any, base: string, locale: Locale): string | null => {
  if (!o) return null
  if (locale === "de") return o[base] ?? null
  return (o[`${base}_${locale}`] ?? o[base]) ?? null
}

export const localizeAuthor = (a: any, locale: Locale) =>
  a
    ? {
        id: a.id,
        name: a.name,
        slug: a.slug,
        role: a.role ?? null,
        photo_url: a.photo_url ?? null,
        linkedin_url: a.linkedin_url ?? null,
        website_url: a.website_url ?? null,
        xing_url: a.xing_url ?? null,
        bio: pick(a, "bio", locale),
      }
    : null

/** Compact shape for listings / cards. */
export const localizeArticleCard = (a: any, locale: Locale) => ({
  id: a.id,
  slug: a.slug,
  cover_image: a.cover_image ?? null,
  category: a.category ?? null,
  published_at: a.published_at ?? null,
  title: pick(a, "title", locale),
  excerpt: pick(a, "excerpt", locale),
  author: localizeAuthor(a.author, locale),
})

/** Full shape for the article detail page, incl. body + resolved SEO meta. */
export const localizeArticleFull = (a: any, locale: Locale) => ({
  ...localizeArticleCard(a, locale),
  status: a.status ?? null,
  body: pick(a, "body", locale),
  meta_title: pick(a, "meta_title", locale) || pick(a, "title", locale),
  meta_description: pick(a, "meta_description", locale) || pick(a, "excerpt", locale),
})
