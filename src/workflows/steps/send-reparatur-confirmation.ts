import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  getReparaturCustomerEmail,
  getReparaturAdminEmail,
  type ReparaturEmailData,
} from "../../lib/email-templates/reparatur"
import { getStoreEmailIdentity } from "../../lib/store-email-identity"

type Input = {
  kd_nr?: string
  name: string
  vorname: string
  kontakt?: string
  strasse_nr: string
  plz: string
  ort: string
  land: string
  tel?: string
  email: string
  kunden_nummer?: string
  geraete_nummer?: string
  anderer_empfaenger?: boolean
  beschreibung: string
  locale?: string
  source_url?: string
  sales_channel_ids?: string[]
}

/**
 * On a submitted repair form, sends TWO emails (both best-effort):
 *   1. Customer — confirmation ("we received it") + a copy of the submission,
 *      locale-selected (en/de).
 *   2. Staff — a notification with all submitted info, to the store mailbox of
 *      the storefront the form came from (always German).
 *
 * Both go out via the per-storefront SMTP account (see store-email-identity).
 * Send errors are logged, never thrown, so a mail failure can't roll back the
 * already-created reparatur row.
 */
export const sendReparaturConfirmationStep = createStep(
  "send-reparatur-confirmation-step",
  async (input: Input, { container }) => {
    const notificationModule = container.resolve(Modules.NOTIFICATION)
    const logger = container.resolve("logger")

    if (!input.email) {
      return new StepResponse(void 0)
    }

    const query = container.resolve("query")

    // Resolve the sales channel name(s) to pick the sending mailbox + recipient.
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

    const isEnglish = (input.locale || "").toLowerCase().startsWith("en")
    const dateStr = new Date().toLocaleString(isEnglish ? "en-GB" : "de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const data: ReparaturEmailData = {
      kd_nr: input.kd_nr,
      name: input.name?.trim() || "",
      vorname: input.vorname?.trim() || "",
      kontakt: input.kontakt,
      strasse_nr: input.strasse_nr,
      plz: input.plz,
      ort: input.ort,
      land: input.land,
      tel: input.tel,
      email: input.email,
      kunden_nummer: input.kunden_nummer,
      geraete_nummer: input.geraete_nummer,
      anderer_empfaenger: !!input.anderer_empfaenger,
      beschreibung: input.beschreibung || "",
      sourceUrl: input.source_url || null,
      dateStr,
    }

    // 1) Customer confirmation.
    try {
      const { subject, html } = getReparaturCustomerEmail(input.locale, data)
      await notificationModule.createNotifications({
        to: input.email,
        channel: "email",
        template: "reparatur-customer",
        data: { account, subject, html },
      })
      logger.info(
        `[reparatur] customer email sent to ${input.email} (lang: ${isEnglish ? "en" : "de"})`
      )
    } catch (e: any) {
      logger.error(`[reparatur] failed to send customer email to ${input.email}: ${e?.message}`)
    }

    // 2) Staff notification.
    if (storeEmail) {
      try {
        const { subject, html } = getReparaturAdminEmail(data)
        await notificationModule.createNotifications({
          to: storeEmail,
          channel: "email",
          template: "reparatur-admin",
          data: { account, subject, html },
        })
        logger.info(`[reparatur] staff email sent to ${storeEmail}`)
      } catch (e: any) {
        logger.error(`[reparatur] failed to send staff email to ${storeEmail}: ${e?.message}`)
      }
    }

    return new StepResponse(void 0)
  }
)
