import type { InquiryEmailData, EmailContent } from "./types"
import { renderInquiryDetails, escapeHtml } from "./shared"

/** English customer email: confirmation + a copy of everything they submitted. */
export function inquiryCustomerEn(data: InquiryEmailData): EmailContent {
  const contactLine = data.storeEmail
    ? `For urgent questions you can reach us at <a href="mailto:${escapeHtml(data.storeEmail)}">${escapeHtml(data.storeEmail)}</a>.`
    : ""

  return {
    subject: "We received your request – we'll be in touch shortly",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#1e3a5f;">Thank you for your request!</h2>
        <p>Hello ${escapeHtml(data.name) || "there"},</p>
        <p>We have received your request and hereby confirm it.</p>
        <p>One of our team members will get in touch with you
           <strong>as soon as possible</strong>.</p>

        <h3 style="color:#1e3a5f;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">
          Your details
        </h3>
        ${renderInquiryDetails(data, {
          name: "Name",
          email: "Email",
          phone: "Phone",
          product: "Product",
          date: "Date",
          message: "Message",
        })}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#6b7280;font-size:13px;">
          ${contactLine}<br/>
          Kind regards,<br/>
          Your team
        </p>
      </div>
    `,
  }
}
