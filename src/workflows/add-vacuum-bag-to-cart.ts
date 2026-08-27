import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { addToCartWorkflow } from "@medusajs/core-flows"
import { resolveVacuumBagVariantStep } from "./steps/resolve-vacuum-bag-variant"

type Input = {
  cart_id: string
  color: string
  thickness_um: number
  width_mm: number
  height_mm: number
  quantity: number // number of packs
}

/**
 * Adds a configured vacuum bag to the cart. Validates the combination against the
 * price matrix, lazily materialises it as a real variant (deterministic SKU), then
 * adds that variant to the cart natively with the matrix price as `unit_price` —
 * so orders reference a real SKU while the matrix stays the single source of truth.
 */
const addVacuumBagToCartWorkflow = createWorkflow(
  "add-vacuum-bag-to-cart",
  function (input: Input) {
    const resolved = resolveVacuumBagVariantStep(
      transform({ input }, ({ input }) => ({
        color: input.color,
        thickness_um: input.thickness_um,
        width_mm: input.width_mm,
        height_mm: input.height_mm,
      }))
    )

    const cart = addToCartWorkflow.runAsStep({
      input: transform({ input, resolved }, ({ input, resolved }) => ({
        cart_id: input.cart_id,
        items: [
          {
            variant_id: resolved.variant_id,
            quantity: input.quantity,
            unit_price: resolved.unit_price,
          },
        ],
      })),
    })

    return new WorkflowResponse(cart)
  }
)

export default addVacuumBagToCartWorkflow
