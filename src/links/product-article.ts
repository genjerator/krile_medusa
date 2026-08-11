import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ArticleModule from "../modules/article"

/**
 * Many-to-many link between core Products and Magazin Articles. Lets an admin
 * relate one or more articles to a product; the storefront shows them at the
 * bottom of the product detail page ("Passende Artikel aus dem Magazin").
 *
 * The link table is created by `medusa db:migrate` (link sync) — safe, it does
 * not touch core tables.
 */
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true },
  { linkable: ArticleModule.linkable.article, isList: true },
  { database: { table: "product_article" } }
)
