import type { InquiryConfirmationData, EmailContent } from "./types"

/** German confirmation email for a submitted inquiry / "Angebot anfordern". */
export function inquiryConfirmationDe({ name, storeEmail }: InquiryConfirmationData): EmailContent {
  const contactLine = storeEmail
    ? `Bei dringenden Fragen erreichen Sie uns unter <a href="mailto:${storeEmail}">${storeEmail}</a>.`
    : ""

  return {
    subject: "Ihre Anfrage ist eingegangen – wir melden uns in Kürze",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Vielen Dank für Ihre Anfrage!</h2>
        <p>Hallo ${name || ""},</p>
        <p>wir haben Ihre Anfrage erhalten und bestätigen hiermit deren Eingang.</p>
        <p>Einer unserer Mitarbeiter wird sich <strong>so schnell wie möglich</strong>
           persönlich bei Ihnen melden.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;">
          ${contactLine}<br/>
          Mit freundlichen Grüßen<br/>
          Ihr Team
        </p>
      </div>
    `,
  }
}
