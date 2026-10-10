import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SES_EMAILS_MODULE } from "../../modules/sesEmails"
import { SES_BATCH_MODULE } from "../../modules/sesBatch"
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
  const sesBatch: any = container.resolve(SES_BATCH_MODULE)
  const marketing: any = container.resolve(MARKETING_MODULE)
  const pg: any = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

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

  // Tracking id + subject override. A campaign group-send (batch has a campaign_id)
  // tracks per-group: the SES tag + unsubscribe token use the BATCH id, so opens /
  // clicks / unsubscribes land on that group's customer_campaign rows. A prototype /
  // ad-hoc batch keeps the old scheme (tracking id = the weekly-action source_id).
  // A campaign may also override the email subject.
  let trackingId = row.source_id as string
  let subjectOverride: string | null = null
  let campaignId: string | null = null
  if (row.batch_id) {
    const batch = await sesBatch.retrieveSesBatch(row.batch_id).catch(() => null)
    if (batch?.campaign_id) {
      trackingId = row.batch_id
      campaignId = batch.campaign_id
      const campaign = await marketing.retrieveEmailCampaign(batch.campaign_id).catch(() => null)
      subjectOverride = (campaign?.subject ?? "").trim() || null
    }
  }

  // 🔒 One-email-per-customer-per-campaign (authoritative). A campaign may assign a
  // customer to several groups; they must still receive the email ONCE. If this
  // customer already has a `sent` row in another group-send of the same campaign,
  // skip. TEST customers (user_type="test") are exempt — they may be mailed
  // repeatedly for QA.
  if (campaignId && profile?.user_type !== "test") {
    const dupe = await pg("ses_emails as e")
      .join("ses_batch as b", "b.id", "e.batch_id")
      .where("b.campaign_id", campaignId)
      .whereNull("b.deleted_at")
      .whereNot("e.batch_id", row.batch_id)
      .where("e.customer_id", row.customer_id)
      .where("e.status", "sent")
      .select("e.id")
      .first()
    if (dupe) {
      await sesEmails.updateSesEmails({ id, status: "skipped", error: "duplicate: already sent in this campaign" })
      return { status: "skipped" }
    }
  }

  const attempts = (row.attempts ?? 0) + 1
  try {
    // Render the template (ref-based outbox → render at send time).
    let subject: string
    let html: string
    if (row.source_type === "weekly_action") {
      const built = await buildWeeklyActionEmail(container, { weeklyActionId: row.source_id })
      subject = subjectOverride || built.subject
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
      campaignId: trackingId,
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
      campaign_id: trackingId,
      sent_at: new Date().toISOString(),
    }).catch(() => {})

    return { status: "sent", messageId }
  } catch (err) {
    const error = (err as Error).message
    await sesEmails.updateSesEmails({ id, status: "failed", error: error.slice(0, 500), attempts })
    return { status: "failed", error }
  }
}
