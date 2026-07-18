import {
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "zod"
import rateLimit from "express-rate-limit"
import multer from "multer"
import { PostNewsletterSchema } from "./store/newsletter/route"
import {
  CreateWeeklyActionSchema,
  GenerateYearSchema,
} from "./admin/weekly-actions/validators"
import { CreateReparaturSchema } from "./store/reparatur/validators"

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
  // Storefront UI locale (de/en/it/fr/ru); used to pick the confirmation-email language.
  locale: z.string().trim().optional(),
  // The storefront page URL the inquiry was submitted from (shown in the emails).
  source_url: z.string().trim().max(500).optional(),
})

export type CreateInquirySchema = z.infer<typeof CreateInquirySchema>

const inquiryRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  // Use the library's default keyGenerator — it's IPv6-safe (normalizes via
  // ipKeyGenerator). A custom `req.ip` generator throws ERR_ERL_KEY_GEN_IPV6 in
  // express-rate-limit v8 and aborts server startup.
  message: { message: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
  standardHeaders: true,
  legacyHeaders: false,
})

const reparaturRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  message: { message: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." },
  standardHeaders: true,
  legacyHeaders: false,
})

// In-memory upload for the admin CRM customer import (Excel/CSV, max 20 MB).
const crmImportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
})

/**
 * Guards the public Brevo webhook. Brevo does not HMAC-sign payloads, so the
 * shared secret in the URL (?token=…) is the gate. Deliberately not rate-limited
 * — a legitimate campaign blast is thousands of events and must not be dropped.
 */
const brevoWebhookAuth = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const expected = process.env.BREVO_WEBHOOK_TOKEN
  if (!expected) {
    return res.status(503).json({ message: "Webhook not configured." })
  }
  const provided = typeof req.query.token === "string" ? req.query.token : ""
  if (provided !== expected) {
    return res.status(401).json({ message: "Unauthorized." })
  }
  return next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/crm-import",
      method: "POST",
      middlewares: [crmImportUpload.single("file") as any],
    },
    {
      matcher: "/webhooks/brevo",
      method: "POST",
      middlewares: [brevoWebhookAuth as any],
    },
    {
      matcher: "/store/inquiries",
      method: "POST",
      middlewares: [inquiryRateLimit as any, validateAndTransformBody(CreateInquirySchema)],
    },
    {
      matcher: "/store/reparatur",
      method: "POST",
      middlewares: [reparaturRateLimit as any, validateAndTransformBody(CreateReparaturSchema)],
    },
    {
      matcher: "/store/newsletter",
      method: "POST",
      middlewares: [validateAndTransformBody(PostNewsletterSchema)],
    },
    {
      matcher: "/admin/weekly-actions",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateWeeklyActionSchema)],
    },
    {
      matcher: "/admin/weekly-actions/generate-year",
      method: "POST",
      middlewares: [validateAndTransformBody(GenerateYearSchema)],
    },
    // Note: the update route ("/admin/weekly-actions/:id") validates its body
    // inside the handler — a ":id" matcher would also shadow "generate-year"
    // and strip its body.
  ],
})
