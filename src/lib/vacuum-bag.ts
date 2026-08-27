/**
 * Shared formatting for the vacuum-bag configurator, used by BOTH the seed
 * script and the add-to-cart workflow so SKUs and product option values line up
 * exactly (a variant's option values must already exist on the product).
 */

export const OPTION_FARBE = "Farbe"
export const OPTION_STAERKE = "Stärke"
export const OPTION_BREITE = "Breite"
export const OPTION_HOEHE = "Höhe"

export const colorOptionValue = (name: string) => name
export const thicknessOptionValue = (um: number) => `${um} µm`
export const widthOptionValue = (mm: number) => `${mm} mm`
export const heightOptionValue = (mm: number) => `${mm} mm`

/** Deterministic SKU, e.g. VB-TRANSPARENT-90-200x300. Idempotency key. */
export const skuFor = (colorSlug: string, um: number, w: number, h: number) =>
  `VB-${colorSlug.toUpperCase()}-${um}-${w}x${h}`

/** Human variant title, e.g. "200×300 mm · 90 µm · Transparent (1000 Stk.)". */
export const variantTitle = (
  colorName: string,
  um: number,
  w: number,
  h: number,
  packSize: number
) => `${w}×${h} mm · ${um} µm · ${colorName} (${packSize} Stk.)`

export const round2 = (n: number) => Math.round(n * 100) / 100
