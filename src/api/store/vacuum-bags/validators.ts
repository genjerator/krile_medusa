import { z } from "zod"

/** Body for POST /store/vacuum-bags/add-to-cart. */
export const AddVacuumBagToCartSchema = z.object({
  cart_id: z.string().trim().min(1),
  color: z.string().trim().min(1).max(60), // colour slug
  type: z.string().trim().min(1).max(60), // type (product line) slug
  width_mm: z.coerce.number().int().positive(),
  height_mm: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(1000).default(1), // number of packs
  // Pack size (Stück per pack). 1000 = matrix base; 100 = derived small pack.
  pack_size: z.coerce.number().int().refine((v) => v === 1000 || v === 100, {
    message: "pack_size must be 100 or 1000",
  }).default(1000),
})

export type AddVacuumBagToCartSchema = z.infer<typeof AddVacuumBagToCartSchema>
