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
import { AddVacuumBagToCartSchema } from "./store/vacuum-bags/validators"
import { PostCookieConsentSchema } from "./store/cookie-consent/validators"
import { getBetterAuthNodeHandler } from "../lib/better-auth/auth"

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
  // Branded-bag configurator: the customer's uploaded logo artwork + a flattened
  // preview (both already uploaded to our S3 via /store/uploads), the logo's
  // original filename, and the chosen placement + bag options (type/color/size).
  logo_url: z.string().trim().url().max(1000).optional(),
  preview_url: z.string().trim().url().max(1000).optional(),
  logo_name: z.string().trim().max(255).optional(),
  details: z.record(z.string(), z.any()).optional(),
  // Honeypot — a hidden field real users never see/fill. Bots that auto-fill
  // every input will populate it; the route then silently no-ops (see route).
  // Must stay in the schema (otherwise Zod strips it before the route sees it).
  website: z.string().optional(),
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

// A visitor fires at most a few consent events (shown + one click); this cap
// only blunts abuse. Best-effort tracking, so a drop here is harmless.
const cookieConsentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests." },
})

// In-memory upload for the admin CRM customer import (Excel/CSV, max 20 MB).
const crmImportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
})

// In-memory upload for customer logo artwork on the "branded bag" configurator
// (PNG/SVG/JPEG/WebP, max 3 MB). Used by the public /store/uploads route.
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    const ok = ["image/png", "image/svg+xml", "image/jpeg", "image/webp"].includes(file.mimetype)
    cb(ok ? null : new Error("Only PNG, SVG, JPEG or WebP images are allowed"), ok)
  },
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

/**
 * Guards the public SES/SNS webhook. SNS signs its payloads (verified in the
 * handler), but the shared secret in the URL (?token=…) is the first gate.
 * Not rate-limited — a campaign blast is thousands of events and must not drop.
 */
const sesWebhookAuth = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const expected = process.env.SES_WEBHOOK_TOKEN
  if (!expected) {
    return res.status(503).json({ message: "Webhook not configured." })
  }
  const provided = typeof req.query.token === "string" ? req.query.token : ""
  if (provided !== expected) {
    return res.status(401).json({ message: "Unauthorized." })
  }
  return next()
}

/**
 * Serves the Better Auth engine at /better-auth/* as a terminating middleware.
 * Medusa's file-router has no catch-all route support, so Better Auth's many
 * sub-paths (sign-in, sign-up, OAuth callbacks, session) are handled here. The
 * Node handler writes and ends the response itself, so `next()` is never called
 * on success; errors are forwarded.
 */
const betterAuthHandler = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  try {
    const handler = await getBetterAuthNodeHandler()
    await handler(req, res)
  } catch (err) {
    next(err)
  }
}

export default defineMiddlewares({
  routes: [
    // Better Auth owns /better-auth/* end to end. Body parsing is disabled so
    // Better Auth receives the raw request stream (Medusa's JSON parser would
    // otherwise consume it first).
    {
      matcher: "/better-auth/*",
      bodyParser: false,
      middlewares: [betterAuthHandler as any],
    },
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
      matcher: "/webhooks/ses",
      method: "POST",
      middlewares: [sesWebhookAuth as any],
    },
    {
      matcher: "/store/inquiries",
      method: "POST",
      middlewares: [inquiryRateLimit as any, validateAndTransformBody(CreateInquirySchema)],
    },
    {
      // Public logo-artwork upload for the branded-bag configurator. Rate-limited
      // and type/size-restricted (see logoUpload). Returns the stored S3 url.
      matcher: "/store/uploads",
      method: "POST",
      middlewares: [inquiryRateLimit as any, logoUpload.single("file") as any],
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
      matcher: "/store/vacuum-bags/add-to-cart",
      method: "POST",
      middlewares: [validateAndTransformBody(AddVacuumBagToCartSchema)],
    },
    {
      matcher: "/store/cookie-consent",
      method: "POST",
      middlewares: [cookieConsentRateLimit as any, validateAndTransformBody(PostCookieConsentSchema)],
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
