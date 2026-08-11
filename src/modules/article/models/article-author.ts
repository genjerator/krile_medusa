import { model } from "@medusajs/framework/utils"
import Article from "./article"

/**
 * A magazine author / contributor. Kept as its own entity (not a plain string on
 * the article) so the same person — with photo, bio and social links — is reused
 * across many articles, gets an author page, and can be expressed as a schema.org
 * `Person` (with `sameAs` → LinkedIn) for SEO.
 *
 * Localised like `contentBlock`: German on the base `bio` column, EN/IT alongside.
 * Table created by a hand-written migration — never run `medusa db:generate article`
 * on this shared DB (it drops core tables).
 */
const ArticleAuthor = model.define("article_author", {
  id: model.id().primaryKey(),
  name: model.text(),
  // URL slug for the author page: /<locale>/magazin/autor/<slug>
  slug: model.text(),
  role: model.text().nullable(),
  photo_url: model.text().nullable(),
  // Social / identity links — rendered as byline links and used as schema.org
  // Person `sameAs` for SEO (connects the author to their real profiles).
  linkedin_url: model.text().nullable(),
  website_url: model.text().nullable(),
  xing_url: model.text().nullable(),
  // Localised short bio (rich text / plain), German on the base column.
  bio: model.text().nullable(),
  bio_en: model.text().nullable(),
  bio_it: model.text().nullable(),
  active: model.boolean().default(true),
  articles: model.hasMany(() => Article, { mappedBy: "author" }),
})

export default ArticleAuthor
