// Locales editable from the product admin widgets. German is the default and
// lives on the base product row / base metadata key; the others are stored as
// translations (see each widget).
export type ProductLocale = { code: string; label: string }

export const DEFAULT_LOCALE = "de"

export const PRODUCT_LOCALES: ProductLocale[] = [
  { code: "de", label: "Deutsch (DE)" },
  { code: "en", label: "English (EN)" },
  { code: "it", label: "Italiano (IT)" },
]

// Dropdown code → locale_code used in the `translation` table (existing
// convention: English is stored as en-US, Italian as it-IT).
export const TRANSLATION_LOCALE: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
}

// Dropdown code → metadata key suffix for per-locale tech-data.
// German keeps the bare key; others get a suffix.
export function metadataKeyForLocale(baseKey: string, code: string): string {
  return code === DEFAULT_LOCALE ? baseKey : `${baseKey}_${code}`
}
