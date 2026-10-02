import { model } from "@medusajs/framework/utils"

/**
 * One row per customer (1:1) — the Medusa-idiomatic "extra columns on customer"
 * without touching the core customer table. Holds the unsubscribe flag and the
 * computed marketing priority.
 *
 * `priority` is the single highest applicable tier; `priority_rank` mirrors it as
 * an int for fast sorting (purchased=1 … opened=6, none=7). `unsubscribed` is a
 * dedicated flag that suppresses everything: when true the recompute job forces
 * priority_rank to 99 regardless of tier.
 */
const MarketingProfile = model.define("marketing_profile", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  // Free-text classification of the customer for campaign targeting/testing, e.g.
  // "test" (seed/QA recipient), "bought_once", "bought_multiple", "opened_brevo",
  // "opened_ses". Plain string for now — may become an enum/derived later.
  user_type: model.text().nullable(),
  unsubscribed: model.boolean().default(false),
  unsubscribed_at: model.dateTime().nullable(),
  // purchased | newsletter | reparatur | angebot | clicked | opened | none
  priority: model.text().default("none"),
  priority_rank: model.number().default(7),
  last_opened_at: model.dateTime().nullable(),
  last_clicked_at: model.dateTime().nullable(),
})

export default MarketingProfile
