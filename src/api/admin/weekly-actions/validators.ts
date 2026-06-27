import { z } from "zod"

export const WeeklyActionItemSchema = z.object({
  product_id: z.string(),
  discount_type: z.enum(["percentage", "fixed"]),
  // percentage → e.g. 20 (20% off); fixed → the new absolute price.
  discount_value: z.number().positive(),
})

export const CreateWeeklyActionSchema = z.object({
  title: z.string().min(1),
  year: z.number().int(),
  iso_week: z.number().int().min(1).max(53),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  default_discount_type: z.enum(["percentage", "fixed"]).optional(),
  default_discount_value: z.number().positive().nullable().optional(),
  items: z.array(WeeklyActionItemSchema).optional(),
})
export type CreateWeeklyActionSchema = z.infer<typeof CreateWeeklyActionSchema>

export const UpdateWeeklyActionSchema = z.object({
  title: z.string().min(1).optional(),
  starts_at: z.coerce.date().optional(),
  ends_at: z.coerce.date().optional(),
  default_discount_type: z.enum(["percentage", "fixed"]).optional(),
  default_discount_value: z.number().positive().nullable().optional(),
  // When provided, replaces the whole item set.
  items: z.array(WeeklyActionItemSchema).optional(),
})
export type UpdateWeeklyActionSchema = z.infer<typeof UpdateWeeklyActionSchema>

export const GenerateYearSchema = z.object({
  year: z.number().int(),
})
export type GenerateYearSchema = z.infer<typeof GenerateYearSchema>
