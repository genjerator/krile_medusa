import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getStoreEmailIdentity } from "../lib/store-email-identity"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const notificationModule = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve("query")

  logger.info(`[order-placed] 🔔 SUBSCRIBER FIRED for order ${data.id}`)

  try {

  const orderId = data.id
  logger.info(`[order-placed] Processing order ${orderId}`)

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id", "display_id", "status", "currency_code",
      "total", "subtotal", "shipping_total", "tax_total",
      "email",
      "sales_channel.name",
      "shipping_address.*",
      "billing_address.*",
      "items.*",
      "items.variant.*",
      "items.product.*",
      "shipping_methods.*",
      "payment_collections.*",
      "payment_collections.payment_sessions.*",
    ],
  })

  const order = orders[0]
  if (!order) {
    logger.error(`[order-placed] Order ${orderId} not found`)
    return
  }

  // Pick the sending mailbox + store recipient based on the storefront
  // (sales channel) the order came from.
  const { account, storeEmail } = getStoreEmailIdentity((order as any).sales_channel?.name)
  const customerEmail = order.email

  const paymentSession = (order as any).payment_collections?.[0]?.payment_sessions?.[0]
  const isPayPal = paymentSession?.provider_id === "pp_paypal_paypal"
  const isVorkasse =
    paymentSession?.provider_id?.startsWith("pp_manual_") ||
    paymentSession?.provider_id === "pp_system_default"
  const paymentMethodLabel = isPayPal
    ? "PayPal"
    : isVorkasse
      ? "Vorkasse"
      : "Auf Rechnung"

  const bankDetailsHtml = `
    <table style="margin-top:8px;font-size:14px;border-collapse:collapse;">
      <tr><td style="color:#6b7280;padding:2px 24px 2px 0;">Inhaber</td><td>Planeta GmbH &amp; Co.KG</td></tr>
      <tr><td style="color:#6b7280;padding:2px 24px 2px 0;">Institut</td><td>Sparkasse Schwaben Bodensee</td></tr>
      <tr><td style="color:#6b7280;padding:2px 24px 2px 0;">BIC / SWIFT</td><td>BYLADEM1MLM</td></tr>
      <tr><td style="color:#6b7280;padding:2px 24px 2px 0;">IBAN</td><td>DE10 7315 0000 1002 0935 14</td></tr>
    </table>
  `

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: (order.currency_code || "EUR").toUpperCase(),
    }).format(amount)

  const itemsHtml = (order.items || []).map((item: any) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.title || item.product?.title || "—"}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unit_price * item.quantity)}</td>
    </tr>
  `).join("")

  const addr = order.shipping_address
  const addressHtml = addr
    ? `${addr.first_name} ${addr.last_name}<br>${addr.address_1}${addr.address_2 ? ", " + addr.address_2 : ""}<br>${addr.postal_code} ${addr.city}<br>${(addr.country_code || "").toUpperCase()}`
    : "—"

  const billAddr = (order as any).billing_address
  const isSameAddress =
    !billAddr ||
    (billAddr.address_1 === addr?.address_1 &&
      billAddr.postal_code === addr?.postal_code &&
      billAddr.city === addr?.city &&
      billAddr.country_code === addr?.country_code &&
      billAddr.first_name === addr?.first_name &&
      billAddr.last_name === addr?.last_name)

  const billingAddressHtml = !isSameAddress && billAddr
    ? `${billAddr.first_name} ${billAddr.last_name}<br>${billAddr.address_1}${billAddr.address_2 ? ", " + billAddr.address_2 : ""}<br>${billAddr.postal_code} ${billAddr.city}<br>${(billAddr.country_code || "").toUpperCase()}`
    : null

  const shippingMethod = (order.shipping_methods || [])[0]?.name || "—"

  // ── Email to customer ──────────────────────────────────────────────────────
  if (customerEmail) {
    await notificationModule.createNotifications({
      to: customerEmail,
      channel: "email",
      template: "order-confirmation",
      data: {
        account,
        subject: `Bestellbestätigung #${order.display_id} – Planeta Industries`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
            <h2 style="color:#1e3a5f;">Vielen Dank für Ihre Bestellung!</h2>
            <p>Ihre Bestellung <strong>#${order.display_id}</strong> wurde erfolgreich aufgenommen.</p>

            <h3 style="border-bottom:2px solid #1e3a5f;padding-bottom:8px;">Bestellübersicht</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="color:#6b7280;font-size:13px;">
                  <th style="text-align:left;padding-bottom:8px;">Artikel</th>
                  <th style="text-align:center;padding-bottom:8px;">Menge</th>
                  <th style="text-align:right;padding-bottom:8px;">Preis</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <table style="width:100%;margin-top:16px;">
              <tr><td style="color:#6b7280;">Zwischensumme</td><td style="text-align:right;">${formatCurrency(order.subtotal || 0)}</td></tr>
              <tr><td style="color:#6b7280;">Versand</td><td style="text-align:right;">${formatCurrency(order.shipping_total || 0)}</td></tr>
              <tr><td style="color:#6b7280;">MwSt.</td><td style="text-align:right;">${formatCurrency(order.tax_total || 0)}</td></tr>
              <tr style="font-weight:bold;font-size:16px;border-top:2px solid #1e3a5f;">
                <td style="padding-top:8px;">Gesamt</td>
                <td style="text-align:right;padding-top:8px;">${formatCurrency(order.total || 0)}</td>
              </tr>
            </table>

            <h3 style="border-bottom:2px solid #1e3a5f;padding-bottom:8px;margin-top:24px;">Lieferadresse</h3>
            <p>${addressHtml}</p>
            ${billingAddressHtml ? `<h3 style="border-bottom:2px solid #1e3a5f;padding-bottom:8px;margin-top:24px;">Rechnungsadresse</h3><p>${billingAddressHtml}</p>` : ""}
            <p><strong>Versandart:</strong> ${shippingMethod}</p>
            <p><strong>Zahlungsmethode:</strong> ${paymentMethodLabel}</p>
            ${isVorkasse ? bankDetailsHtml : ""}
            ${isPayPal ? `<p style="background:#fff8e1;border:1px solid #ffe082;padding:10px;border-radius:6px;font-size:13px;">✅ Ihre Zahlung wurde über PayPal erfolgreich verarbeitet.</p>` : ""}

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#6b7280;font-size:13px;">
              Bei Fragen kontaktieren Sie uns unter <a href="mailto:${storeEmail}">${storeEmail}</a><br/>
              Planeta Industries GmbH
            </p>
          </div>
        `,
      },
    })
    logger.info(`[order-placed] Confirmation email sent to customer: ${customerEmail}`)
  }

  // ── Notification to store ──────────────────────────────────────────────────
  if (storeEmail) {
    await notificationModule.createNotifications({
      to: storeEmail,
      channel: "email",
      template: "order-notification",
      data: {
        account,
        subject: `🛒 Neue Bestellung #${order.display_id} von ${customerEmail}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
            <h2 style="color:#1e3a5f;">Neue Bestellung eingegangen</h2>
            <p><strong>Bestellung #${order.display_id}</strong> von <strong>${customerEmail}</strong></p>
            <p><strong>Gesamt:</strong> ${formatCurrency(order.total || 0)}</p>

            <h3>Artikel</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="color:#6b7280;font-size:13px;">
                  <th style="text-align:left;padding-bottom:8px;">Artikel</th>
                  <th style="text-align:center;padding-bottom:8px;">Menge</th>
                  <th style="text-align:right;padding-bottom:8px;">Preis</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <h3 style="margin-top:16px;">Lieferadresse</h3>
            <p>${addressHtml}</p>
            ${billingAddressHtml ? `<h3 style="margin-top:16px;">Rechnungsadresse</h3><p>${billingAddressHtml}</p>` : ""}
            <p><strong>Versandart:</strong> ${shippingMethod}</p>
            <p><strong>Zahlungsmethode:</strong> ${paymentMethodLabel}${isPayPal ? " ✅ (PayPal bestätigt)" : ""}</p>

            <p style="margin-top:24px;">
              <a href="${process.env.ADMIN_URL || "http://localhost:9000/app"}/orders/${orderId}"
                 style="background:#1e3a5f;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                Bestellung im Admin ansehen
              </a>
            </p>
          </div>
        `,
      },
    })
    logger.info(`[order-placed] Notification email sent to store: ${storeEmail}`)
  }
  } catch (err: any) {
    logger.error(`[order-placed] ❌ Error: ${err.message}`)
    logger.error(err.stack)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
