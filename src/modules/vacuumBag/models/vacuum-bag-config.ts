import { model } from "@medusajs/framework/utils"

/**
 * Per-product configurator settings. There is exactly one active config row, and
 * it is **linked to the single configurable Medusa product** (handle
 * `vakuumiertueten`) via `src/links/product-vacuum-bag-config.ts`. It holds the
 * pack size the matrix prices refer to and the default colour to pre-select.
 */
const VacuumBagConfig = model.define("vacuum_bag_config", {
  id: model.id().primaryKey(),
  pack_size: model.number().default(1000), // Stück per pack the matrix price refers to
  default_color_id: model.text().nullable(), // Colour pre-selected in the dropdown
  active: model.boolean().default(true),
})

export default VacuumBagConfig
