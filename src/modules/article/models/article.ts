import { model } from "@medusajs/framework/utils"
import ArticleAuthor from "./article-author"

/**
 * A magazine ("Magazin") article / blog post. Localised like `contentBlock`:
 * German lives on the base columns, English/Italian on `_en` / `_it`. Body is
 * rich-text HTML (admin editor emits HTML; storefront renders it). Drafts and
 * not-yet-published (`published_at` in the future) are hidden from the storefront.
 *
 * Table created by a hand-written migration — never run `medusa db:generate
 * article` on this shared DB (it drops core tables).
 */
const Article = model.define("article", {
  id: model.id().primaryKey(),
  // URL slug: /<locale>/magazin/<slug> — one shared slug across locales (v1).
  slug: model.text(),
  status: model.enum(["draft", "published"]).default("draft"),
  // Listing order + "not before" gate; NULL while drafting.
  published_at: model.dateTime().nullable(),
  cover_image: model.text().nullable(),
  // Flat category label for v1 (no filtering yet); tags/categories can come later.
  category: model.text().nullable(),
  // Sales channel this article belongs to (Industries vs Planeta GmbH). NULL =
  // shown in all channels (global). Stored as a plain id like weeklyActionItem's
  // product_id / storefrontBranding — the storefront is scoped by its publishable
  // key's sales channel.
  sales_channel_id: model.text().nullable(),

  // i18n — German on base column, EN/IT alongside.
  title: model.text(),
  title_en: model.text().nullable(),
  title_it: model.text().nullable(),

  excerpt: model.text().nullable(),
  excerpt_en: model.text().nullable(),
  excerpt_it: model.text().nullable(),

  body: model.text().nullable(),
  body_en: model.text().nullable(),
  body_it: model.text().nullable(),

  // SEO — fall back to title / excerpt when empty.
  meta_title: model.text().nullable(),
  meta_title_en: model.text().nullable(),
  meta_title_it: model.text().nullable(),

  meta_description: model.text().nullable(),
  meta_description_en: model.text().nullable(),
  meta_description_it: model.text().nullable(),

  // Optional author (schema.org Person + LinkedIn) — nullable belongsTo → author_id.
  author: model.belongsTo(() => ArticleAuthor, { mappedBy: "articles" }).nullable(),
})

export default Article
