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

/** Deterministic SKU, e.g. VB-TRANSPARENT-STD-90-200x300. Idempotency key. */
export const skuFor = (
  colorSlug: string,
  typeSlug: string,
  w: number,
  h: number
) => `VB-${colorSlug.toUpperCase()}-${typeSlug.toUpperCase()}-${w}x${h}`

/** Human variant title, e.g. "200×300 mm · Standard glatt 90 µm · Transparent (1000 Stk.)". */
export const variantTitle = (
  colorName: string,
  typeName: string,
  w: number,
  h: number,
  packSize: number
) => `${w}×${h} mm · ${typeName} · ${colorName} (${packSize} Stk.)`

export const round2 = (n: number) => Math.round(n * 100) / 100
