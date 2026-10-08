import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../../modules/sesEmails"
import { MARKETING_MODULE } from "../../modules/marketing"
import { sendCampaignEmail } from "./send"
import { buildWeeklyActionEmail } from "../email-templates/weekly-action/build"
import { upsertCustomerCampaign } from "../customer-campaigns"

/**
 * THE one send function for the SES outbox — used by both the manual "Senden"
 * button and (later) the queue job. Guarantees the send-time suppression check:
 * it re-reads `marketing_profile.unsubscribed` right before sending and skips if
 * set. Renders the template at send time (ref-based outbox), sends via SES, and
 * records the send in `customer_campaign` for tracking.
 *
 * Returns the resulting status; never throws for a normal send failure (the row
 * is marked `failed` with the error).
 */
export type SendOutboxResult =
  | { status: "sent"; messageId: string }
  | { status: "skipped" }
  | { status: "failed"; error: string }
  | { status: "already_sent" }

export async function sendOutboxEmail(
  container: MedusaContainer,
  id: string,
  opts?: { overrideTo?: string }
): Promise<SendOutboxResult> {
  const sesEmails: any = container.resolve(SES_EMAILS_MODULE)
  const marketing: any = container.resolve(MARKETING_MODULE)

  const row = await sesEmails.retrieveSesEmail(id).catch(() => null)
  if (!row) throw new Error(`Outbox email ${id} not found`)
  if (row.status === "sent") return { status: "already_sent" }

  // A campaign-agnostic (unassigned) row can't render — refuse to send it.
  if (!row.source_type || !row.source_id) {
    const error = "No campaign assigned to this batch (source_type/source_id empty)"
    await sesEmails.updateSesEmails({ id, status: "failed", error })
    return { status: "failed", error }
  }

  // Claim: flip to sending so a double-click can't double-send.
  await sesEmails.updateSesEmails({ id, status: "sending" })

  // 🔒 Send-time suppression check (authoritative).
  const [profile] = await marketing.listMarketingProfiles(
    { customer_id: row.customer_id },
    { take: 1 }
  )
  if (profile?.unsubscribed) {
    await sesEmails.updateSesEmails({ id, status: "skipped" })
    return { status: "skipped" }
  }

  const attempts = (row.attempts ?? 0) + 1
  try {
    // Render the template (ref-based outbox → render at send time).
    let subject: string
    let html: string
    if (row.source_type === "weekly_action") {
      const built = await buildWeeklyActionEmail(container, { weeklyActionId: row.source_id })
      subject = built.subject
      html = built.html
    } else {
      throw new Error(`Unsupported source_type: ${row.source_type}`)
    }

    // Test override: when set, deliver to this inbox instead of the real
    // recipient (the row still records the intended customer). Suppression above
    // still applies so this can't bypass an unsubscribe.
    const to = opts?.overrideTo?.trim() || row.to_email

    const { messageId } = await sendCampaignEmail({
      to,
      customerId: row.customer_id,
      subject,
      html,
      campaignId: row.source_id,
      // Weekly actions are a planeta.de campaign → send from email.planeta.de.
      account: row.source_type === "weekly_action" ? "planeta" : "industries",
    })

    await sesEmails.updateSesEmails({
      id,
      status: "sent",
      ses_message_id: messageId,
      sent_at: new Date(),
      error: null,
      attempts,
    })
    // Tracking: opens/clicks/bounces will attach via the webhook.
    await upsertCustomerCampaign(marketing, row.customer_id, "ses", {
      campaign_id: row.source_id,
      sent_at: new Date().toISOString(),
    }).catch(() => {})

    return { status: "sent", messageId }
  } catch (err) {
    const error = (err as Error).message
    await sesEmails.updateSesEmails({ id, status: "failed", error: error.slice(0, 500), attempts })
    return { status: "failed", error }
  }
}
