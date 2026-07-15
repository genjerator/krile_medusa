import type { ReparaturEmailData, EmailContent } from "./types"
import { renderReparaturDetails } from "./shared"

const LABELS = {
  customer: "Kunde",
  kdNr: "Kd. Nr.",
  name: "Name",
  vorname: "Vorname",
  address: "Adresse",
  tel: "Telefon",
  email: "E-Mail",
  kundenNummer: "Kunden-Nr.",
  geraeteNummer: "Geräte-Nr.",
  page: "Seite",
  date: "Datum",
  description: "Beschreibung",
}

/** Customer confirmation (German): repair request received + a copy of the data. */
export function reparaturCustomerDe(data: ReparaturEmailData): EmailContent {
  return {
    subject: "Ihre Reparaturanfrage bei Planeta ist eingegangen",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Vielen Dank für Ihre Reparaturanfrage</h2>
        <p>Hallo ${data.vorname || data.name},</p>
        <p>
          wir haben Ihre Reparaturanfrage erhalten und melden uns so schnell wie
          möglich bei Ihnen. Bitte legen Sie dem Paket das ausgedruckte
          Reparaturformular bei, wenn Sie das Gerät einsenden.
        </p>

        <h3 style="color:#1e3a5f;font-size:15px;margin-top:24px;">Ihre Angaben</h3>
        ${renderReparaturDetails(data, LABELS)}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;">
          Planeta GmbH &amp; Co. KG · Kornstraße 28 · 87719 Mindelheim · Tel: 08261/76233
        </p>
      </div>
    `,
  }
}
