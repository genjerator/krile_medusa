import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKETING_MODULE } from "../../modules/marketing"
import { logSesEvent, markSesEventMatched } from "./ses-event-log"
import {
  findCustomerIdByEmail,
  upsertMarketingProfile,
  setUnsubscribed,
} from "./marketing-profile"

/**
 * Records one SES event (already parsed from the SNS envelope) against the
 * marketing tables. Flow (per the design doc §5):
 *   1. log the raw event FIRST (never lost — SES has no re-poll);
 *   2. map eventType → a `customer_campaign` timestamp column;
 *   3. match a row by `ses_message_id`, else by (campaign_id + customer), else
 *      fall back to profile-level engagement; hard bounce / complaint suppress
 *      the customer.
 * Timestamps are only ever FILLED, never overwritten.
 */

type AnyObj = Record<string, any>

const COLUMN_BY_TYPE: Record<string, string> = {
  Send: "sent_at",
  Delivery: "delivered_at",
  Open: "opened_at",
  Click: "clicked_at",
  Complaint: "complained_at",
  // Bounce handled specially (only Permanent bounces stamp bounced_at + suppress).
}

export async function recordSesEvent(
  container: MedusaContainer,
  event: AnyObj
): Promise<{ matched: boolean }> {
  const marketing: any = container.resolve(MARKETING_MODULE)

  const type: string = event?.eventType || event?.notificationType || "Unknown"
  const mail: AnyObj = event?.mail ?? {}
  const messageId: string | null = mail?.messageId ?? null
  const campaignId: string | null = mail?.tags?.campaign_id?.[0] ?? null

  // Recipient + timestamp vary by event type.
  let email: string | null = mail?.destination?.[0] ?? null
  let when = new Date(mail?.timestamp ?? Date.now())
  let column: string | null = COLUMN_BY_TYPE[type] ?? null
  let suppress = false

  switch (type) {
    case "Delivery":
      when = new Date(event?.delivery?.timestamp ?? mail?.timestamp ?? Date.now())
      break
    case "Open":
      when = new Date(event?.open?.timestamp ?? Date.now())
      break
    case "Click":
      when = new Date(event?.click?.timestamp ?? Date.now())
      break
    case "Complaint":
      email = event?.complaint?.complainedRecipients?.[0]?.emailAddress ?? email
      when = new Date(event?.complaint?.timestamp ?? Date.now())
      suppress = true
      break
    case "Bounce": {
      email = event?.bounce?.bouncedRecipients?.[0]?.emailAddress ?? email
      when = new Date(event?.bounce?.timestamp ?? Date.now())
      // Only hard (Permanent) bounces count — soft/transient bounces are logged only.
      if (event?.bounce?.bounceType === "Permanent") {
        column = "bounced_at"
        suppress = true
      }
      break
    }
    default:
      break // Reject, DeliveryDelay, transient Bounce, Unknown → log only
  }

  // 1) Durable raw log FIRST (best-effort; must never throw).
  const logId = await logSesEvent(container, {
    event: type,
    email,
    message_id: messageId,
    campaign_id: campaignId,
    matched: false,
    payload: event,
  }).catch(() => null)

  const customerId = email ? await findCustomerIdByEmail(container, email) : null
  let matched = false

  // 2) Apply the timestamp to a campaign row.
  if (column) {
    let row: AnyObj | null = null
    if (messageId) {
      const [r] = await marketing.listCustomerCampaigns(
        { source: "ses", ses_message_id: messageId },
        { take: 1 }
      )
      row = r ?? null
    }
    if (!row && customerId && campaignId) {
      const [r] = await marketing.listCustomerCampaigns(
        { source: "ses", campaign_id: campaignId, customer_id: customerId },
        { take: 1 }
      )
      row = r ?? null
    }

    if (row) {
      const patch: AnyObj = {}
      if (!row[column]) patch[column] = when
      if (messageId && !row.ses_message_id) patch.ses_message_id = messageId
      if (Object.keys(patch).length) {
        await marketing.updateCustomerCampaigns({ id: row.id, ...patch })
      }
      matched = true
    } else if (customerId && campaignId) {
      await marketing.createCustomerCampaigns({
        customer_id: customerId,
        source: "ses",
        campaign_id: campaignId,
        ses_message_id: messageId,
        [column]: when,
      })
      matched = true
    }
  }

  // 3) Profile-level engagement, even without a campaign row.
  if (customerId && (type === "Open" || type === "Click")) {
    await upsertMarketingProfile(
      container,
      customerId,
      type === "Open" ? { last_opened_at: when } : { last_clicked_at: when }
    ).catch(() => {})
    matched = true
  }

  // Suppression on hard bounce / complaint.
  if (suppress && customerId) {
    await setUnsubscribed(container, customerId, when).catch(() => {})
    matched = true
  }

  if (matched && logId) {
    await markSesEventMatched(container, logId).catch(() => {})
  }
  return { matched }
}
