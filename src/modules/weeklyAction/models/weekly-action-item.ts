import { model } from "@medusajs/framework/utils"
import WeeklyAction from "./weekly-action"

/**
 * One product inside a weekly action, with its own discount rule. Storing the
 * rule (type + value) per item lets "20% off these four" and "this one exactly
 * 16€" coexist, and lets the price sync recompute correctly if a base price
 * changes later.
 */
const WeeklyActionItem = model.define("weekly_action_item", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  discount_type: model.enum(["percentage", "fixed"]),
  // percentage → e.g. 20 (= 20% off); fixed → the new absolute price.
  discount_value: model.float(),
  weekly_action: model.belongsTo(() => WeeklyAction, { mappedBy: "items" }),
})

export default WeeklyActionItem
