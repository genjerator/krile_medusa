import { z } from "zod"

/** Body for POST /store/vacuum-bags/add-to-cart. */
export const AddVacuumBagToCartSchema = z.object({
  cart_id: z.string().trim().min(1),
  color: z.string().trim().min(1).max(60), // colour slug
  thickness_um: z.coerce.number().int().positive(),
  width_mm: z.coerce.number().int().positive(),
  height_mm: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(1000).default(1), // number of packs
})

export type AddVacuumBagToCartSchema = z.infer<typeof AddVacuumBagToCartSchema>
