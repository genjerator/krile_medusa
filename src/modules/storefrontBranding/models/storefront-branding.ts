import { model } from "@medusajs/framework/utils"

/**
 * Per-storefront branding, keyed by sales channel (one row per channel). Lets a
 * domain like planeta-buegelsysteme.de show a distinct hero + accent color while
 * running the same storefront codebase — managed in the admin, no redeploy.
 * The storefront fetches its own row via the publishable key's sales channel
 * (GET /store/branding). Table created by hand-written migration (never db:generate).
 */
const StorefrontBranding = model.define("storefront_branding", {
  id: model.id().primaryKey(),
  sales_channel_id: model.text(),
  hero_image_url: model.text().nullable(),
  hero_title: model.text().nullable(),
  hero_subtitle: model.text().nullable(),
  primary_color: model.text().nullable(),
})

export default StorefrontBranding
