import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  getInquiryCustomerEmail,
  getInquiryAdminEmail,
  type InquiryEmailData,
} from "../../lib/email-templates/inquiry-confirmation"
import { getStoreEmailIdentity } from "../../lib/store-email-identity"

type Input = {
  email: string
  name: string
  message: string
  phone?: string
  locale?: string
  product_id?: string
  source_url?: string
  sales_channel_ids?: string[]
}

/** Storefront base URL per sales channel (for the customer product link). */
const STOREFRONT_BASE_BY_CHANNEL: Record<string, string> = {
  IndustriesWebshop: "https://www.planetaindustries.de",
  PlanetaWebshop: "https://www.planeta.de",
}
const DEFAULT_STOREFRONT = "https://www.planetaindustries.de"

/**
 * On a submitted inquiry / contact-form, sends TWO emails (both best-effort):
 *   1. Customer — confirmation ("we received it, will contact you shortly")
 *      plus a copy of everything they submitted. Locale-selected (en/de).
 *   2. Admin/staff — a notification with all the submitted info, to the store
 *      mailbox of the storefront the inquiry came from (always German).
 *
 * Both go out via the per-storefront SMTP account (see store-email-identity).
 * Send errors are logged, never thrown, so a mail failure can't roll back the
 * already-created inquiry.
 */
export const sendInquiryConfirmationStep = createStep(
  "send-inquiry-confirmation-step",
  async (input: Input, { container }) => {
    const notificationModule = container.resolve(Modules.NOTIFICATION)
    const logger = container.resolve("logger")

    if (!input.email) {
      return new StepResponse(void 0)
    }

    const query = container.resolve("query")

    // Resolve the sales channel name(s) (we only have ids here) to pick the
    // sending mailbox + contact address. A storefront's publishable key can be
    // linked to several channels, so resolve them all and let the identity
    // helper match on the shop channel regardless of order.
    let salesChannelNames: string[] = []
    if (input.sales_channel_ids?.length) {
      const { data } = await query.graph({
        entity: "sales_channel",
        filters: { id: input.sales_channel_ids },
        fields: ["name"],
      })
      salesChannelNames = (data ?? []).map((s: any) => s.name).filter(Boolean)
    }

    const { account, storeEmail } = getStoreEmailIdentity(salesChannelNames)

    // Product info — only when the inquiry is about a real product (the contact
    // form uses a sentinel product_id like "contact-form").
    let productLabel: string | null = null
    let productUrl: string | null = null
    let adminProductUrl: string | null = null
    if (input.product_id?.startsWith("prod_")) {
      const { data } = await query.graph({
        entity: "product",
        filters: { id: input.product_id },
        fields: ["title", "handle"],
      })
      const product = data?.[0]
      if (product) {
        productLabel = product.title
        const channelForUrl = salesChannelNames.find((n) => STOREFRONT_BASE_BY_CHANNEL[n])
        const base = STOREFRONT_BASE_BY_CHANNEL[channelForUrl ?? ""] ?? DEFAULT_STOREFRONT
        productUrl = product.handle ? `${base}/de/products/${product.handle}` : null
        const adminBase = (process.env.ADMIN_URL || "").replace(/\/+$/, "")
        adminProductUrl = adminBase ? `${adminBase}/products/${input.product_id}` : null
      }
    }

    const isEnglish = (input.locale || "").toLowerCase().startsWith("en")
    const dateStr = new Date().toLocaleString(isEnglish ? "en-GB" : "de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const data: InquiryEmailData = {
      name: input.name?.trim() || "",
      email: input.email,
      phone: input.phone,
      message: input.message || "",
      productLabel,
      productUrl,
      adminProductUrl,
      sourceUrl: input.source_url || null,
      dateStr,
      storeEmail,
    }

    // 1) Customer confirmation.
    try {
      const { subject, html } = getInquiryCustomerEmail(input.locale, data)
      await notificationModule.createNotifications({
        to: input.email,
        channel: "email",
        template: "inquiry-customer",
        data: { account, subject, html },
      })
      logger.info(
        `[inquiry] customer email sent to ${input.email} (lang: ${isEnglish ? "en" : "de"})`
      )
    } catch (e: any) {
      logger.error(`[inquiry] failed to send customer email to ${input.email}: ${e?.message}`)
    }

    // 2) Admin/staff notification.
    if (storeEmail) {
      try {
        const { subject, html } = getInquiryAdminEmail(data)
        await notificationModule.createNotifications({
          to: storeEmail,
          channel: "email",
          template: "inquiry-admin",
          data: { account, subject, html },
        })
        logger.info(`[inquiry] admin email sent to ${storeEmail}`)
      } catch (e: any) {
        logger.error(`[inquiry] failed to send admin email to ${storeEmail}: ${e?.message}`)
      }
    }

    return new StepResponse(void 0)
  }
)
