import { model } from "@medusajs/framework/utils"
import VacuumBagPrice from "./vacuum-bag-price"

/**
 * A selectable film colour for the vacuum-bag configurator (Transparent, Blau,
 * …). Colours get their own table because — unlike thickness/width/height, which
 * are just distinct numbers derived from the price matrix — a colour carries a
 * preview `image_url` (swapped into the main product image on hover) and a `hex`
 * chip for the dropdown.
 */
const VacuumBagColor = model.define("vacuum_bag_color", {
  id: model.id().primaryKey(),
  name: model.text(), // Display label, e.g. "Transparent"
  slug: model.text(), // Stable key used in SKUs, e.g. "transparent" → VB-TRANSPARENT-…
  hex: model.text().nullable(), // Swatch colour for the dropdown chip
  image_url: model.text().nullable(), // Hover-preview product image for this colour
  rank: model.number().default(0), // Dropdown order (0-based)
  is_default: model.boolean().default(false), // Pre-selected colour (assumed Transparent)
  active: model.boolean().default(true),
  prices: model.hasMany(() => VacuumBagPrice, { mappedBy: "color" }),
})

export default VacuumBagColor
