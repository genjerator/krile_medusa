import { model } from "@medusajs/framework/utils"

/**
 * A reusable piece of static, rich-text content ("content block"), addressed by
 * a unique `key` (e.g. "about-hero", "shipping-info"). The storefront pulls a
 * block by key wherever it wants static copy — no redeploy to edit text.
 *
 * Localised like the product "Technische Daten" feature: German lives on the
 * base `body` column, English/Italian on `body_en` / `body_it`. Content is
 * stored as rich-text HTML (the admin editor emits HTML; the storefront renders
 * it with dangerouslySetInnerHTML).
 *
 * Table created by a hand-written migration — never run
 * `medusa db:generate contentBlock` on this shared DB (it drops core tables).
 */
const ContentBlock = model.define("content_block", {
  id: model.id().primaryKey(),
  // Unique slug used to fetch the block from the storefront.
  key: model.text(),
  // Admin-facing label so the list is readable (not shown on the storefront).
  title: model.text().nullable(),
  // Rich-text HTML, per locale. `body` is the German (default) content.
  body: model.text().nullable(),
  body_en: model.text().nullable(),
  body_it: model.text().nullable(),
  // Drafts are hidden from the storefront.
  status: model.enum(["draft", "published"]).default("published"),
})

export default ContentBlock
