import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"
import rateLimit from "express-rate-limit"

export const CreateInquirySchema = z.object({
  product_id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  message: z.string().min(1),
  phone: z.string().optional(),
})

export type CreateInquirySchema = z.infer<typeof CreateInquirySchema>

const inquiryRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  keyGenerator: (req) => req.ip ?? "unknown",
  message: { message: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
  standardHeaders: true,
  legacyHeaders: false,
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/inquiries",
      method: "POST",
      middlewares: [inquiryRateLimit as any, validateAndTransformBody(CreateInquirySchema)],
    },
  ],
})
