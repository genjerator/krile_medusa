import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { createProductVariantsWorkflow } from "@medusajs/core-flows"
import { VACUUM_BAG_MODULE } from "../../modules/vacuumBag"
import {
  OPTION_FARBE,
  OPTION_TYP,
  OPTION_BREITE,
  OPTION_HOEHE,
  colorOptionValue,
  typeOptionValue,
  widthOptionValue,
  heightOptionValue,
  skuFor,
  variantTitle,
  priceForPack,
  DEFAULT_PACK_SIZE,
  PACK_SIZES,
} from "../../lib/vacuum-bag"

const PRODUCT_HANDLE = "vakuumiertueten"

type Input = {
  color: string // colour slug
  type: string // type (product line) slug
  width_mm: number
  height_mm: number
  pack_size?: number // Stück per pack (1000 base | 100 small); default 1000
}

export type ResolvedVariant = {
  variant_id: string
  unit_price: number // per-pack price from the matrix (source of truth)
  currency_code: string
}

/**
 * Validates a chosen configuration against the price matrix and materialises it
 * as a real variant under the single configurable product — created lazily, only
 * the first time a combination is bought, keyed by a deterministic SKU. Returns
 * the variant id plus the authoritative per-pack matrix price (passed to the cart
 * as `unit_price`, so the matrix stays the single source of truth).
 *
 * Compensation deletes only a variant this step created.
 */
export const resolveVacuumBagVariantStep = createStep(
  "resolve-vacuum-bag-variant-step",
  async (input: Input, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productModule: any = container.resolve(Modules.PRODUCT)
    const vacuumBag: any = container.resolve(VACUUM_BAG_MODULE)

    // 1) Resolve the chosen colour (id + name) first. Used to key the price lookup
    //    by scalar color_id (robust) and for the variant option value + title.
    const { data: colorRows } = await query.graph({
      entity: "vacuum_bag_color",
      fields: ["id", "name"],
      filters: { slug: input.color, active: true } as any,
    })
    if (!colorRows[0]) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Diese Farbe ist nicht verfügbar."
      )
    }
    const colorId: string = colorRows[0].id

    // 2) Matrix lookup — defines both price and availability, keyed by the FULL
    //    combination (colour, type, width, height). Transparent is priced across the
    //    whole matrix; other colours only in their specific rows — a colour/size with
    //    no active row is "not available" (the storefront shows it as "coming soon").
    const { data: rows } = await query.graph({
      entity: "vacuum_bag_price",
      fields: ["price", "currency_code", "type.name"],
      filters: {
        width_mm: input.width_mm,
        height_mm: input.height_mm,
        active: true,
        type: { slug: input.type },
        color_id: colorId,
      } as any,
    })
    const row: any = rows[0]
    if (!row) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Diese Kombination ist nicht verfügbar."
      )
    }

    const colorName: string = colorRows[0]?.name ?? input.color
    const typeName: string = row.type?.name ?? input.type
    const currency_code: string = row.currency_code ?? "eur"

    // Pack size: 1000 (matrix base) or the derived 100-Stück pack. The matrix
    // price is per 1000; the 100-pack price is computed from it (single source in
    // lib/vacuum-bag). Guard against an unexpected value.
    const packSize = PACK_SIZES.includes(input.pack_size as any)
      ? (input.pack_size as number)
      : DEFAULT_PACK_SIZE
    const unit_price: number = priceForPack(row.price, packSize)

    // 2) The single configurable product.
    const [product] = await productModule.listProducts(
      { handle: PRODUCT_HANDLE },
      { take: 1 }
    )
    if (!product) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Configurable product "${PRODUCT_HANDLE}" not found — run seed-vacuum-bags.`
      )
    }

    // 3) Find-or-create the variant by its deterministic SKU (pack-size aware).
    const sku = skuFor(input.color, input.type, input.width_mm, input.height_mm, packSize)
    const existing = await productModule.listProductVariants({ sku }, { take: 1 })
    if (existing[0]) {
      return new StepResponse<ResolvedVariant, string | null>(
        { variant_id: existing[0].id, unit_price, currency_code },
        null
      )
    }

    let createdVariantId: string | null = null
    try {
      const { result } = await createProductVariantsWorkflow(container).run({
        input: {
          product_variants: [
            {
              product_id: product.id,
              title: variantTitle(
                colorName,
                typeName,
                input.width_mm,
                input.height_mm,
                packSize
              ),
              sku,
              manage_inventory: false,
              options: {
                [OPTION_FARBE]: colorOptionValue(colorName),
                [OPTION_TYP]: typeOptionValue(typeName),
                [OPTION_BREITE]: widthOptionValue(input.width_mm),
                [OPTION_HOEHE]: heightOptionValue(input.height_mm),
              },
              prices: [{ amount: unit_price, currency_code }],
            },
          ],
        },
      })
      createdVariantId = (result as any[])[0].id
    } catch (e) {
      // Concurrency: another shopper created the same combo first. The SKU unique
      // constraint rejects the duplicate → re-fetch the winner.
      const raced = await productModule.listProductVariants({ sku }, { take: 1 })
      if (!raced[0]) throw e
      return new StepResponse<ResolvedVariant, string | null>(
        { variant_id: raced[0].id, unit_price, currency_code },
        null
      )
    }

    return new StepResponse<ResolvedVariant, string | null>(
      { variant_id: createdVariantId!, unit_price, currency_code },
      createdVariantId
    )
  },
  async (createdVariantId: string | null | undefined, { container }) => {
    if (!createdVariantId) return
    const productModule: any = container.resolve(Modules.PRODUCT)
    await productModule.deleteProductVariants(createdVariantId)
  }
)
