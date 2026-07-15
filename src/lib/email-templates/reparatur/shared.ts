import type { ReparaturEmailData } from "./types"

/** Escape user-provided text before embedding it in HTML email bodies. */
export function escapeHtml(value: string | undefined | null): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type ReparaturLabels = {
  customer: string
  kdNr: string
  name: string
  vorname: string
  address: string
  tel: string
  email: string
  kundenNummer: string
  geraeteNummer: string
  page: string
  date: string
  description: string
}

/**
 * Renders the submitted repair-form fields as an HTML table. Shared by the
 * customer and staff emails so both show exactly the same information.
 */
export function renderReparaturDetails(data: ReparaturEmailData, labels: ReparaturLabels): string {
  const row = (label: string, valueHtml: string) =>
    valueHtml
      ? `<tr>
          <td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap;">${label}</td>
          <td style="padding:6px 0;color:#111;">${valueHtml}</td>
        </tr>`
      : ""

  const address = [
    data.strasse_nr,
    [data.plz, data.ort].filter(Boolean).join(" "),
    data.land,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join("<br />")

  const pageHtml = data.sourceUrl
    ? `<a href="${escapeHtml(data.sourceUrl)}">${escapeHtml(data.sourceUrl)}</a>`
    : ""

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0;">
      ${row(labels.kdNr, escapeHtml(data.kd_nr))}
      ${row(labels.name, escapeHtml(data.name))}
      ${row(labels.vorname, escapeHtml(data.vorname))}
      ${row(labels.address, address)}
      ${row(labels.tel, escapeHtml(data.tel))}
      ${row(labels.email, `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>`)}
      ${row(labels.kundenNummer, escapeHtml(data.kunden_nummer))}
      ${row(labels.geraeteNummer, escapeHtml(data.geraete_nummer))}
      ${row(labels.page, pageHtml)}
      ${row(labels.date, escapeHtml(data.dateStr))}
      ${row(
        labels.description,
        `<div style="white-space:pre-wrap;word-break:break-word;">${escapeHtml(data.beschreibung)}</div>`
      )}
    </table>`
}
