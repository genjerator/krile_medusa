import nodemailer, { Transporter } from "nodemailer"
import { signUnsubscribeToken } from "./unsubscribe-token"

/**
 * SES sender over the SES SMTP interface (reuses `SES_SMTP_*` + verified
 * `SES_SMTP_FROM`). Every send carries the `campaign-tracking` configuration set
 * and a `campaign_id` message tag via SES's custom SMTP headers, so the event
 * pipeline (SNS → /webhooks/ses) tracks opens/clicks/bounces. Adds an RFC-8058
 * one-click List-Unsubscribe header when the unsubscribe secret + base URL are set.
 *
 * This is the seed of the Phase 2 sender; today it powers the admin test send and
 * the "send a weekly action to a customer" route.
 */

let cached: Transporter | null = null

function getTransport(): Transporter {
  if (cached) return cached
  const host = process.env.SES_SMTP_HOST
  if (!host) throw new Error("SES_SMTP_HOST is not configured")
  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SES_SMTP_PORT ?? 587),
    secure: false,
    requireTLS: (process.env.SES_SMTP_TLS ?? "starttls") === "starttls",
    auth: { user: process.env.SES_SMTP_USER, pass: process.env.SES_SMTP_PASSWORD },
  })
  return cached
}

/** Per-recipient signed unsubscribe URL, or null if unsubscribe isn't configured. */
function unsubscribeUrl(customerId: string, campaignId: string): string | null {
  const base = process.env.UNSUBSCRIBE_BASE_URL
  if (!base || !process.env.MARKETING_UNSUBSCRIBE_SECRET) return null
  const token = signUnsubscribeToken(customerId, campaignId)
  return `${base.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(token)}`
}

/**
 * Resolves the From address/name by brand account:
 *   - "planeta"    → planeta.de campaigns, sent from `email.planeta.de` (SES_SMTP_FROM_PLANETA)
 *   - "industries" → default (SES_SMTP_FROM, currently planetex.de)
 * Falls back to the industries sender if the planeta one isn't configured.
 */
function resolveFrom(account?: "industries" | "planeta"): { from: string; name: string } {
  if (account === "planeta" && process.env.SES_SMTP_FROM_PLANETA) {
    return {
      from: process.env.SES_SMTP_FROM_PLANETA,
      name: process.env.SES_SMTP_FROM_NAME_PLANETA || "Planeta",
    }
  }
  return {
    from: process.env.SES_SMTP_FROM || "",
    name: process.env.SES_SMTP_FROM_NAME || "Planeta Industries",
  }
}

/** Core send: one email to one recipient, tracked under `campaignId`. */
export async function sendCampaignEmail(opts: {
  to: string
  customerId: string
  subject: string
  html: string
  campaignId: string
  account?: "industries" | "planeta"
}): Promise<{ messageId: string }> {
  const { from, name: fromName } = resolveFrom(opts.account)
  if (!from) throw new Error("No SES From configured (SES_SMTP_FROM / SES_SMTP_FROM_PLANETA)")

  const unsubUrl = unsubscribeUrl(opts.customerId, opts.campaignId)
  // Fill the visible {{unsubscribe_url}} placeholder in the template body with the
  // per-recipient signed link (no-op for templates without the placeholder).
  const html = opts.html.split("{{unsubscribe_url}}").join(unsubUrl ?? "#")

  const headers: Record<string, string> = {
    "X-SES-CONFIGURATION-SET": "campaign-tracking",
    "X-SES-MESSAGE-TAGS": `campaign_id=${opts.campaignId}`,
  }
  if (unsubUrl) {
    headers["List-Unsubscribe"] = `<${unsubUrl}>`
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
  }

  const info = await getTransport().sendMail({
    from: `"${fromName}" <${from}>`,
    to: opts.to,
    subject: opts.subject,
    html,
    headers,
  })
  return { messageId: info.messageId }
}

/** Simple fixed test email (admin "Send test email" button). */
export async function sendTestEmail(opts: {
  to: string
  customerId: string
  campaignId?: string
}): Promise<{ messageId: string }> {
  const campaignId = opts.campaignId ?? "test"
  const html =
    `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1b1f24">` +
    `<h2 style="color:#0b2a4a">Test-E-Mail</h2>` +
    `<p>Dies ist eine Test-E-Mail aus dem Kampagnen-Tool (AWS SES). Wenn Sie sie erhalten, funktioniert der Versand.</p>` +
    `<p style="font-size:12px;color:#6b7280">campaign_id: ${campaignId} · ${new Date().toLocaleString("de-DE")}</p>` +
    `</div>`
  return sendCampaignEmail({
    to: opts.to,
    customerId: opts.customerId,
    subject: "Test-E-Mail — Planeta Industries Kampagnen",
    html,
    campaignId,
  })
}
