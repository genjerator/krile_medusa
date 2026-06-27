import { model } from "@medusajs/framework/utils"
import WeeklyActionItem from "./weekly-action-item"

/**
 * A single week's promotion ("Weekly Action"). The merchant plans a whole year
 * ahead as ~52 of these, each pinned to a calendar week with a non-overlapping
 * window. The campaign owns a native Medusa Price List (`price_list_id`) of type
 * "sale" that carries the computed sale prices.
 *
 * Which campaign is live is controlled manually via `is_active`: exactly one
 * action is active at a time, and only the active one's Price List is live
 * (windowless + active), overriding the calendar. The storefront shows the
 * active campaign; when none is active, nothing is shown.
 */
const WeeklyAction = model.define("weekly_action", {
  id: model.id().primaryKey(),
  title: model.text(),
  // Calendar slot (ISO week). Uniqueness of year+week enforced in the workflow.
  year: model.number(),
  iso_week: model.number(),
  starts_at: model.dateTime(),
  ends_at: model.dateTime(),
  // `draft` = no products yet (skipped); `planned` = has a synced price list.
  status: model.enum(["draft", "planned"]).default("draft"),
  // Manual on/off switch. Exactly one action is active at a time; the active one
  // is the campaign the storefront shows and whose sale Price List is live now.
  is_active: model.boolean().default(false),
  // Defaults that pre-fill the per-item discount form.
  default_discount_type: model.enum(["percentage", "fixed"]).default("percentage"),
  default_discount_value: model.float().nullable(),
  // The native sale Price List this campaign owns (created on first sync).
  price_list_id: model.text().nullable(),
  // Reserved for future Brevo API automation (unused for now).
  brevo_campaign_id: model.text().nullable(),
  brevo_template_id: model.text().nullable(),
  brevo_synced_at: model.dateTime().nullable(),
  brevo_status: model.text().nullable(),
  items: model.hasMany(() => WeeklyActionItem, { mappedBy: "weekly_action" }),
})

export default WeeklyAction
