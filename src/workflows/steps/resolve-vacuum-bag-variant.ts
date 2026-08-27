import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { createProductVariantsWorkflow } from "@medusajs/core-flows"
import { VACUUM_BAG_MODULE } from "../../modules/vacuumBag"
import {
  OPTION_FARBE,
  OPTION_STAERKE,
  OPTION_BREITE,
  OPTION_HOEHE,
  colorOptionValue,
  thicknessOptionValue,
  widthOptionValue,
  heightOptionValue,
  skuFor,
  variantTitle,
} from "../../lib/vacuum-bag"

const PRODUCT_HANDLE = "vakuumiertueten"

type Input = {
  color: string // colour slug
  thickness_um: number
  width_mm: number
  height_mm: number
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

    // 1) Matrix lookup — defines both price and availability.
    const { data: rows } = await query.graph({
      entity: "vacuum_bag_price",
      fields: ["price", "currency_code", "color.slug", "color.name"],
      filters: {
        thickness_um: input.thickness_um,
        width_mm: input.width_mm,
        height_mm: input.height_mm,
        active: true,
        color: { slug: input.color },
      } as any,
    })
    const row: any = rows[0]
    if (!row) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Diese Kombination ist nicht verfügbar."
      )
    }

    const colorName: string = row.color?.name ?? input.color
    const unit_price: number = row.price
    const currency_code: string = row.currency_code ?? "eur"

    // 2) The single configurable product + its pack size (for the variant title).
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
    const [config] = await vacuumBag.listVacuumBagConfigs({ active: true })
    const packSize = config?.pack_size ?? 1000

    // 3) Find-or-create the variant by its deterministic SKU.
    const sku = skuFor(input.color, input.thickness_um, input.width_mm, input.height_mm)
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
                input.thickness_um,
                input.width_mm,
                input.height_mm,
                packSize
              ),
              sku,
              manage_inventory: false,
              options: {
                [OPTION_FARBE]: colorOptionValue(colorName),
                [OPTION_STAERKE]: thicknessOptionValue(input.thickness_um),
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
