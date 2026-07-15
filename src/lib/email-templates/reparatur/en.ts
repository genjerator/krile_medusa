import type { ReparaturEmailData, EmailContent } from "./types"
import { renderReparaturDetails } from "./shared"

const LABELS = {
  customer: "Customer",
  kdNr: "Customer no.",
  name: "Name",
  vorname: "First name",
  address: "Address",
  tel: "Phone",
  email: "Email",
  kundenNummer: "Customer no.",
  geraeteNummer: "Device no.",
  page: "Page",
  date: "Date",
  description: "Description",
}

/** Customer confirmation (English): repair request received + a copy of the data. */
export function reparaturCustomerEn(data: ReparaturEmailData): EmailContent {
  return {
    subject: "We received your Planeta repair request",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Thank you for your repair request</h2>
        <p>Hello ${data.vorname || data.name},</p>
        <p>
          we have received your repair request and will get back to you as soon as
          possible. When you send in the device, please enclose the printed repair
          form with the package.
        </p>

        <h3 style="color:#1e3a5f;font-size:15px;margin-top:24px;">Your details</h3>
        ${renderReparaturDetails(data, LABELS)}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;">
          Planeta GmbH &amp; Co. KG · Kornstraße 28 · 87719 Mindelheim · Tel: 08261/76233
        </p>
      </div>
    `,
  }
}
