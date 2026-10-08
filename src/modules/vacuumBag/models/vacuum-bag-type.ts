import { model } from "@medusajs/framework/utils"
import VacuumBagPrice from "./vacuum-bag-price"

/**
 * A product line / "Ausführung" for the vacuum-bag configurator — the dropdown
 * that replaces a free thickness choice. Each type corresponds to one section of
 * the Niederwieser price list (EasyVac PRO / BOSS / SF / MONO-PE) and carries its
 * own FIXED film thickness, so thickness is implied by the type and never offered
 * as a separate control. A type also carries a preview `image_url` (smooth types
 * share the transparent EasyVac PRO photo; embossed share the BOSS photo).
 *
 * Examples: "Standard glatt 90 µm", "Strukturiert / Geprägt", "Kochbeutel",
 * "Kochbeutel geprägt", "Recyclebar (MONO-PE)".
 */
const VacuumBagType = model.define("vacuum_bag_type", {
  id: model.id().primaryKey(),
  name: model.text(), // Display label incl. µm, e.g. "Standard glatt 90 µm"
  slug: model.text(), // Stable key used in SKUs, e.g. "std-90" → VB-…-STD-90-…
  thickness_um: model.number(), // Fixed film thickness for this line (µm)
  description: model.text().nullable(), // Short help text shown under the dropdown
  image_url: model.text().nullable(), // Preview product image for this type
  rank: model.number().default(0), // Dropdown order (0-based)
  is_default: model.boolean().default(false), // Pre-selected type
  active: model.boolean().default(true),
  prices: model.hasMany(() => VacuumBagPrice, { mappedBy: "type" }),
})

export default VacuumBagType
