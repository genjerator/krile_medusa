import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { verifyUnsubscribeToken } from "../../lib/ses/unsubscribe-token"
import { setUnsubscribed } from "../../lib/ses/marketing-profile"
import { MARKETING_MODULE } from "../../modules/marketing"

/**
 * Public unsubscribe endpoint (NOT under /store, so no publishable key needed).
 * The link in a campaign email points here with a signed `?token=`.
 *
 * GET  — shows a confirm button and does NOT unsubscribe. Email security scanners
 *        pre-fetch (GET) links, so acting on GET would unsubscribe people who
 *        never clicked (R3).
 * POST  — performs the unsubscribe. Serves both the human confirm (form posts to
 *        the same ?token= URL) and RFC 8058 one-click (`List-Unsubscribe-Post`,
 *        where the mail client POSTs the List-Unsubscribe URL that carries ?token).
 */

function html(res: MedusaResponse, status: number, body: string) {
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  // Don't let intermediaries cache an unsubscribe page.
  res.setHeader("Cache-Control", "no-store")
  return res.status(status).send(
    `<!doctype html><html lang="de"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex">` +
    `<title>Newsletter abmelden</title>` +
    `<style>body{font-family:system-ui,Arial,sans-serif;background:#f6f7f9;margin:0;padding:40px 16px;color:#1b1f24}` +
    `.card{max-width:460px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;text-align:center}` +
    `h1{font-size:19px;margin:0 0 10px}p{font-size:14px;line-height:1.5;color:#4b5563;margin:0 0 18px}` +
    `button{background:#0b2a4a;color:#fff;border:0;border-radius:8px;padding:12px 22px;font-size:15px;font-weight:600;cursor:pointer}</style>` +
    `</head><body><div class="card">${body}</div></body></html>`
  )
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const token = typeof req.query.token === "string" ? req.query.token : ""
  const parsed = verifyUnsubscribeToken(token)
  if (!parsed) {
    return html(res, 400, `<h1>Ungültiger Link</h1><p>Dieser Abmelde-Link ist ungültig oder unvollständig.</p>`)
  }
  const action = `/unsubscribe?token=${encodeURIComponent(token)}`
  return html(
    res,
    200,
    `<h1>Newsletter abbestellen</h1>` +
    `<p>Möchten Sie keine weiteren Marketing-E-Mails von uns erhalten? Bestätigen Sie unten.</p>` +
    `<form method="POST" action="${action}"><button type="submit">Jetzt abmelden</button></form>`
  )
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const token = typeof req.query.token === "string" ? req.query.token : ""
  const parsed = verifyUnsubscribeToken(token)
  if (!parsed) {
    return html(res, 400, `<h1>Ungültiger Link</h1><p>Dieser Abmelde-Link ist ungültig oder unvollständig.</p>`)
  }

  try {
    await setUnsubscribed(req.scope, parsed.customerId)

    // Best-effort: stamp the originating campaign row, if we know it.
    if (parsed.campaignId) {
      const marketing: any = req.scope.resolve(MARKETING_MODULE)
      const [row] = await marketing.listCustomerCampaigns(
        { source: "ses", campaign_id: parsed.campaignId, customer_id: parsed.customerId },
        { take: 1 }
      )
      if (row && !row.unsubscribed_at) {
        await marketing.updateCustomerCampaigns({ id: row.id, unsubscribed_at: new Date() })
      }
    }
  } catch (err) {
    logger.error(`[unsubscribe] Failed for customer ${parsed.customerId}: ${(err as Error).message}`)
    return html(res, 500, `<h1>Etwas ist schiefgelaufen</h1><p>Bitte versuchen Sie es später erneut.</p>`)
  }

  logger.info(`[unsubscribe] Customer ${parsed.customerId} unsubscribed (campaign=${parsed.campaignId ?? "-"})`)
  return html(res, 200, `<h1>Sie wurden abgemeldet</h1><p>Sie erhalten keine weiteren Marketing-E-Mails von uns. Danke!</p>`)
}
