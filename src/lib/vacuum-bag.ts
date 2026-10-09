/**
 * Shared formatting for the vacuum-bag configurator, used by BOTH the seed
 * script and the add-to-cart workflow so SKUs and product option values line up
 * exactly (a variant's option values must already exist on the product).
 *
 * The configurable product has four options: Farbe, Typ, Breite, Höhe. Thickness
 * is NOT an option — it is fixed by the Typ (e.g. "Standard glatt 90 µm").
 */

export const OPTION_FARBE = "Farbe"
export const OPTION_TYP = "Typ"
export const OPTION_BREITE = "Breite"
export const OPTION_HOEHE = "Höhe"

export const colorOptionValue = (name: string) => name
export const typeOptionValue = (name: string) => name
export const widthOptionValue = (mm: number) => `${mm} mm`
export const heightOptionValue = (mm: number) => `${mm} mm`

export const round2 = (n: number) => Math.round(n * 100) / 100

// ─── Pack sizes & small-pack pricing ────────────────────────────────────────
// The price matrix is quoted per pack of DEFAULT_PACK_SIZE (1000 Stück). The
// smaller 100-Stück pack is derived from that base: divide by the pack ratio
// (1000/100 = 10), then +5%, then +65% — i.e. × (1.05 × 1.65). Defined once here
// and exposed via /store/vacuum-bags/options so the storefront shows the exact
// same price the backend charges.
export const DEFAULT_PACK_SIZE = 1000
export const SMALL_PACK_SIZE = 100
export const SMALL_PACK_SURCHARGE = 1.05 * 1.65 // +5% then +65% = 1.7325
export const PACK_SIZES = [DEFAULT_PACK_SIZE, SMALL_PACK_SIZE] as const

/** Per-pack price for a given pack size, from the 1000-Stück matrix base price. */
export const priceForPack = (basePrice1000: number, packSize: number): number =>
  packSize === SMALL_PACK_SIZE
    ? round2((basePrice1000 / (DEFAULT_PACK_SIZE / SMALL_PACK_SIZE)) * SMALL_PACK_SURCHARGE)
    : basePrice1000

/**
 * Deterministic SKU, e.g. VB-TRANSPARENT-STD-90-200x300 (1000-pack) or
 * …-200x300-100 (100-pack). The default (1000) pack keeps the original suffix-less
 * SKU so existing variants resolve unchanged; smaller packs append "-<size>".
 */
export const skuFor = (
  colorSlug: string,
  typeSlug: string,
  w: number,
  h: number,
  packSize: number = DEFAULT_PACK_SIZE
) => {
  const base = `VB-${colorSlug.toUpperCase()}-${typeSlug.toUpperCase()}-${w}x${h}`
  return packSize === DEFAULT_PACK_SIZE ? base : `${base}-${packSize}`
}

/** Human variant title, e.g. "200×300 mm · Standard glatt 90 µm · Transparent (1000 Stk.)". */
export const variantTitle = (
  colorName: string,
  typeName: string,
  w: number,
  h: number,
  packSize: number
) => `${w}×${h} mm · ${typeName} · ${colorName} (${packSize} Stk.)`
