import { model } from "@medusajs/framework/utils"
import VacuumBagColor from "./vacuum-bag-color"
import VacuumBagType from "./vacuum-bag-type"

/**
 * The price matrix — the configurator's single source of truth. One row per full
 * combination (colour × type × width × height) with an exact per-pack price.
 * Thickness is NOT a key: it is fixed by the `type` (one µm per product line) and
 * stored here only denormalised, for the SKU/variant title.
 *
 * Two jobs:
 *  - **Pricing:** a live price is an exact lookup by (colour, type, width, height)
 *    → `price`.
 *  - **Availability:** the offered dropdown values (type/width/height) are the
 *    DISTINCT values present here, and a combination with no active row is "not
 *    available". So the range and the price are never maintained twice.
 *
 * `price` is the price for one pack (see `VacuumBagConfig.pack_size`, default
 * 1000 Stk.), stored as-is (69.00 = €69.00, never cents). The customer chooses
 * how many packs via the cart line-item quantity.
 */
const VacuumBagPrice = model.define("vacuum_bag_price", {
  id: model.id().primaryKey(),
  thickness_um: model.number(), // Denormalised from the type (µm)
  width_mm: model.number(),
  height_mm: model.number(),
  price: model.float(), // Per-pack price, stored as-is (not cents)
  currency_code: model.text().default("eur"),
  active: model.boolean().default(true),
  color: model.belongsTo(() => VacuumBagColor, { mappedBy: "prices" }),
  type: model.belongsTo(() => VacuumBagType, { mappedBy: "prices" }),
})

export default VacuumBagPrice
