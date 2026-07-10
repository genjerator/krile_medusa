import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib"

/**
 * Builds a printable A4 PDF of a submitted Reparaturformular, mirroring the
 * paper form's layout (Auftraggeber / Gerät / Beschreibung / Unterschrift).
 *
 * Uses the Helvetica standard font — its WinAnsi encoding covers German
 * umlauts (ä ö ü ß), so no font embedding is needed. Returns the raw PDF bytes.
 */
export type ReparaturPdfData = {
  kd_nr?: string | null
  name: string
  vorname: string
  kontakt?: string | null
  strasse_nr: string
  plz: string
  ort: string
  land: string
  tel?: string | null
  email: string
  kunden_nummer?: string | null
  geraete_nummer?: string | null
  anderer_empfaenger?: boolean | null
  datum?: string | null
  beschreibung: string
  unterschrift_ort?: string | null
  unterschrift_datum?: string | null
  unterschrift?: string | null
  created_at?: string | Date | null
}

const NAVY = rgb(0.118, 0.227, 0.373) // #1e3a5f
const GREY = rgb(0.42, 0.45, 0.5)
const BLACK = rgb(0.07, 0.07, 0.07)

const A4 = { width: 595.28, height: 841.89 }
const MARGIN = 56
const CONTENT_WIDTH = A4.width - MARGIN * 2

/** Replace characters outside Helvetica's WinAnsi range so encoding never throws. */
const clean = (v: unknown): string =>
  String(v ?? "")
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x09\x0A\x20-\xFF]/g, "?")

export async function buildReparaturPdf(data: ReparaturPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([A4.width, A4.height])
  let y = A4.height - MARGIN

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([A4.width, A4.height])
      y = A4.height - MARGIN
    }
  }

  const drawText = (text: string, x: number, size: number, f: PDFFont, color = BLACK) => {
    page.drawText(text, { x, y, size, font: f, color })
  }

  // Word-wrap a string to a max width; returns the lines.
  const wrap = (text: string, size: number, f: PDFFont, maxWidth: number): string[] => {
    const out: string[] = []
    for (const raw of clean(text).split("\n")) {
      if (raw === "") {
        out.push("")
        continue
      }
      let line = ""
      for (const word of raw.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word
        if (f.widthOfTextAtSize(candidate, size) > maxWidth && line) {
          out.push(line)
          line = word
        } else {
          line = candidate
        }
      }
      if (line) out.push(line)
    }
    return out
  }

  // ── Header ──────────────────────────────────────────────────────────────
  drawText("Reparaturformular", MARGIN, 22, bold, NAVY)
  y -= 26
  drawText("Planeta GmbH & Co. KG · Kornstraße 28 · 87719 Mindelheim · Tel: 08261/76233", MARGIN, 9, font, GREY)
  y -= 10
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4.width - MARGIN, y },
    thickness: 1,
    color: NAVY,
  })
  y -= 22

  const sectionHeader = (title: string) => {
    ensureSpace(26)
    drawText(title, MARGIN, 13, bold, NAVY)
    y -= 18
  }

  // A "Label: value" row with a fixed label column.
  const row = (label: string, value: unknown) => {
    const size = 11
    const labelWidth = 130
    const valueLines = wrap(String(value ?? ""), size, font, CONTENT_WIDTH - labelWidth)
    const lines = valueLines.length ? valueLines : [""]
    ensureSpace(lines.length * (size + 4) + 2)
    drawText(`${label}`, MARGIN, size, bold, GREY)
    lines.forEach((ln, i) => {
      if (i > 0) y -= size + 4
      page.drawText(ln, { x: MARGIN + labelWidth, y, size, font, color: BLACK })
    })
    y -= size + 8
  }

  // ── Auftraggeber ────────────────────────────────────────────────────────
  sectionHeader("Auftraggeber")
  row("Kd. Nr.", data.kd_nr)
  row("Name", data.name)
  row("Vorname", data.vorname)
  row("Kontakt", data.kontakt)
  row("Strasse / Nr.", data.strasse_nr)
  row("PLZ / Ort", [data.plz, data.ort].filter(Boolean).join(" "))
  row("Land", data.land)
  row("Tel.", data.tel)
  row("E-Mail", data.email)
  row("Anderer Empfänger", data.anderer_empfaenger ? "Ja" : "Nein")
  if (data.datum) row("Datum", data.datum)

  y -= 6
  // ── Gerät ─────────────────────────────────────────────────────────────────
  sectionHeader("Gerät")
  row("Kunden-Nummer", data.kunden_nummer)
  row("Geräte-Nummer", data.geraete_nummer)

  y -= 6
  // ── Beschreibung ──────────────────────────────────────────────────────────
  sectionHeader("Beschreibung")
  {
    const size = 11
    const lines = wrap(data.beschreibung, size, font, CONTENT_WIDTH)
    for (const ln of lines.length ? lines : [""]) {
      ensureSpace(size + 4)
      page.drawText(ln, { x: MARGIN, y, size, font, color: BLACK })
      y -= size + 4
    }
  }

  y -= 12
  // ── Unterschrift ──────────────────────────────────────────────────────────
  sectionHeader("Unterschrift")
  row("Ort", data.unterschrift_ort)
  row("Datum", data.unterschrift_datum)
  row("Unterschrift", data.unterschrift)

  // ── Footer: submission timestamp ──────────────────────────────────────────
  if (data.created_at) {
    const stamp = new Date(data.created_at).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    ensureSpace(20)
    y -= 8
    drawText(`Eingegangen am ${stamp}`, MARGIN, 9, font, GREY)
  }

  return await doc.save()
}
