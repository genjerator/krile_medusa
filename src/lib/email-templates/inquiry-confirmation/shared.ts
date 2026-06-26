import type { InquiryEmailData } from "./types"

/** Escape user-provided text before embedding it in HTML email bodies. */
export function escapeHtml(value: string | undefined | null): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type DetailLabels = {
  name: string
  email: string
  phone: string
  product: string
  page: string
  date: string
  message: string
}

/**
 * Renders the submitted inquiry fields as an HTML table. Shared by the customer
 * and admin emails so both show exactly the same information.
 */
export function renderInquiryDetails(data: InquiryEmailData, labels: DetailLabels): string {
  const row = (label: string, valueHtml: string) =>
    valueHtml
      ? `<tr>
          <td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${label}</td>
          <td style="padding:6px 0;color:#111;">${valueHtml}</td>
        </tr>`
      : ""

  const productHtml = data.productUrl
    ? `<a href="${data.productUrl}">${escapeHtml(data.productLabel ?? data.productUrl)}</a>`
    : escapeHtml(data.productLabel ?? "")

  const pageHtml = data.sourceUrl
    ? `<a href="${escapeHtml(data.sourceUrl)}">${escapeHtml(data.sourceUrl)}</a>`
    : ""

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0;">
      ${row(labels.name, escapeHtml(data.name))}
      ${row(labels.email, `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>`)}
      ${row(labels.phone, escapeHtml(data.phone))}
      ${row(labels.product, productHtml)}
      ${row(labels.page, pageHtml)}
      ${row(labels.date, escapeHtml(data.dateStr))}
      ${row(
        labels.message,
        `<div style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(data.message)}</div>`
      )}
    </table>`
}
