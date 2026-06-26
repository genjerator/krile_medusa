import type { InquiryEmailData, EmailContent } from "./types"
import { renderInquiryDetails, escapeHtml } from "./shared"

/**
 * Admin/staff notification: a new inquiry came in via a contact / request form.
 * Always German (internal staff), and lists everything the customer submitted.
 */
export function inquiryAdminDe(data: InquiryEmailData): EmailContent {
  return {
    subject: `📨 Neue Anfrage von ${data.name || data.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Neue Anfrage eingegangen</h2>
        <p>Über das Kontakt-/Anfrageformular ist eine neue Anfrage eingegangen:</p>

        ${renderInquiryDetails(data, {
          name: "Name",
          email: "E-Mail",
          phone: "Telefon",
          product: "Produkt",
          page: "Seite",
          date: "Datum",
          message: "Nachricht",
        })}

        ${
          data.adminProductUrl
            ? `<p style="margin-top:16px;">
                 <a href="${escapeHtml(data.adminProductUrl)}"
                    style="background:#1e3a5f;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;">
                   Produkt im Admin ansehen
                 </a>
               </p>`
            : ""
        }

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;">
          Antworten Sie direkt an
          <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>,
          um den Kunden zu kontaktieren.
        </p>
      </div>
    `,
  }
}
