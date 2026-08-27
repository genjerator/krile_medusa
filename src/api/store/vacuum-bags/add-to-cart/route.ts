import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import addVacuumBagToCartWorkflow from "../../../../workflows/add-vacuum-bag-to-cart"
import { AddVacuumBagToCartSchema } from "../validators"

/**
 * Adds a configured vacuum bag to the customer's cart.
 * POST /store/vacuum-bags/add-to-cart
 *   { cart_id, color, thickness_um, width_mm, height_mm, quantity }
 * Returns the updated cart. 400 if the combination isn't in the price matrix.
 */
export async function POST(
  req: MedusaStoreRequest<AddVacuumBagToCartSchema>,
  res: MedusaResponse
) {
  const { result } = await addVacuumBagToCartWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  return res.status(200).json({ cart: result })
}
