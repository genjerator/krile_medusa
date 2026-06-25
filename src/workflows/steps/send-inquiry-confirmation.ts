import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { getInquiryConfirmationEmail } from "../../lib/email-templates/inquiry-confirmation"
import { getStoreEmailIdentity } from "../../lib/store-email-identity"

type Input = {
  email: string
  name: string
  locale?: string
  sales_channel_id?: string
}

/**
 * Sends a "we received your request, someone will contact you soon" confirmation
 * email to the customer who submitted an inquiry / "Angebot anfordern" form.
 *
 * The template is chosen by storefront locale (see the inquiry-confirmation
 * templates: `en` → English, everything else → German).
 *
 * Best-effort: any send error is logged but NOT thrown, so a mail failure can
 * never roll back the already-created inquiry. No compensation needed.
 */
export const sendInquiryConfirmationStep = createStep(
  "send-inquiry-confirmation-step",
  async (input: Input, { container }) => {
    const notificationModule = container.resolve(Modules.NOTIFICATION)
    const logger = container.resolve("logger")

    if (!input.email) {
      return new StepResponse(void 0)
    }

    // Resolve the sales channel name (we only have its id here) to pick the
    // sending mailbox + contact address for the storefront the inquiry came from.
    let salesChannelName: string | undefined
    if (input.sales_channel_id) {
      const query = container.resolve("query")
      const { data } = await query.graph({
        entity: "sales_channel",
        filters: { id: input.sales_channel_id },
        fields: ["name"],
      })
      salesChannelName = data?.[0]?.name
    }

    const { account, storeEmail } = getStoreEmailIdentity(salesChannelName)
    const { subject, html } = getInquiryConfirmationEmail(input.locale, {
      name: input.name?.trim() || "",
      storeEmail,
    })

    try {
      await notificationModule.createNotifications({
        to: input.email,
        channel: "email",
        template: "inquiry-confirmation",
        data: { account, subject, html },
      })
      const lang = (input.locale || "").toLowerCase().startsWith("en") ? "en" : "de"
      logger.info(`[inquiry] confirmation email sent to ${input.email} (lang: ${lang})`)
    } catch (e: any) {
      logger.error(`[inquiry] failed to send confirmation email to ${input.email}: ${e?.message}`)
    }

    return new StepResponse(void 0)
  }
)
