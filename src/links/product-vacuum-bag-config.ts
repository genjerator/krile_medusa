import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import VacuumBagModule from "../modules/vacuumBag"

/**
 * One-to-one link between the single configurable Medusa product (handle
 * `vakuumiertueten`) and its vacuumBag config row. Lets the storefront resolve
 * the configurator (pack size, default colour, matrix) from the product, and the
 * add-to-cart workflow find the product to attach lazily-created variants to.
 *
 * The link table is created by `medusa db:migrate` (link sync) — safe, it does
 * not touch core tables.
 */
export default defineLink(
  ProductModule.linkable.product,
  VacuumBagModule.linkable.vacuumBagConfig
)
