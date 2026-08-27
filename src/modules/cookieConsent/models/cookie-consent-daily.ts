import { model } from "@medusajs/framework/utils"

/**
 * Daily cookie-banner interaction tallies per brand, flushed from Redis once a
 * day. `shown` = banner displayed to a visitor; `accepted` / `declined` = button
 * clicks. "Didn't click at all" is derived on read as shown − accepted − declined.
 */
const CookieConsentDaily = model.define("cookie_consent_daily", {
  id: model.id().primaryKey(),
  brand: model.text(), // "industries" | "planeta"
  date: model.text(), // "YYYY-MM-DD"
  shown: model.float().default(0),
  accepted: model.float().default(0),
  declined: model.float().default(0),
})

export default CookieConsentDaily
