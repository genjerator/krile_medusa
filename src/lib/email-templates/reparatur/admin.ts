import type { ReparaturEmailData, EmailContent } from "./types"
import { renderReparaturDetails, escapeHtml } from "./shared"

/**
 * Staff notification (always German): a new repair request came in via the
 * storefront form. Lists everything the customer submitted.
 */
export function reparaturAdminDe(data: ReparaturEmailData): EmailContent {
  const who = [data.vorname, data.name].filter(Boolean).join(" ") || data.email
  return {
    subject: `🔧 Neue Reparaturanfrage von ${who}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Neue Reparaturanfrage eingegangen</h2>
        <p>Über das Reparaturformular ist eine neue Anfrage eingegangen:</p>

        ${renderReparaturDetails(data, {
          customer: "Kunde",
          kdNr: "Kd. Nr.",
          name: "Name",
          vorname: "Vorname",
          kontakt: "Kontakt",
          address: "Adresse",
          tel: "Telefon",
          email: "E-Mail",
          kundenNummer: "Kunden-Nr.",
          geraeteNummer: "Geräte-Nr.",
          andererEmpfaenger: "Anderer Empfänger",
          yes: "Ja",
          page: "Seite",
          date: "Datum",
          description: "Beschreibung",
        })}

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
