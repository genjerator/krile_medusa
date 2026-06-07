import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"
import rateLimit from "express-rate-limit"
import { PostNewsletterSchema } from "./store/newsletter/route"

const stripTags = (value: string) => value.replace(/<[^>]*>/g, "").trim()

export const CreateInquirySchema = z.object({
  product_id: z.string(),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1).transform(stripTags).refine((val) => val.length > 0, {
    message: "Name must contain text",
  }),
  message: z
    .string()
    .trim()
    .min(1)
    .max(256, "Message must be 256 characters or less")
    .transform(stripTags)
    .refine((val) => val.length > 0, { message: "Message must contain text" }),
  phone: z
    .string()
    .trim()
    .regex(/^[+a-zA-Z0-9\s()-]*$/, "Phone number may only contain letters, numbers, spaces, ( ) - and a + sign")
    .optional()
    .or(z.literal("")),
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
    {
      matcher: "/store/newsletter",
      method: "POST",
      middlewares: [validateAndTransformBody(PostNewsletterSchema)],
    },
  ],
})
