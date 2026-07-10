import { model } from "@medusajs/framework/utils"

/**
 * Digitised "Reparaturformular" (repair form) submission — one row per form a
 * customer sends from the storefront. Fields mirror `Reparaturformular_fi.pdf`,
 * with the PDF's single "Firma" field split into `name` + `vorname`.
 */
const Reparatur = model.define("reparatur", {
  id: model.id().primaryKey(),

  // Auftraggeber (orderer) — address block
  kd_nr: model.text().nullable(), // Kd. Nr.
  name: model.text(), // was "Firma" → Name
  vorname: model.text(), // was "Firma" → Vorname
  kontakt: model.text().nullable(), // Kontakt
  strasse_nr: model.text(), // Strasse/Nr.
  plz: model.text(), // PLZ
  ort: model.text(), // Ort
  land: model.text(), // Land
  tel: model.text().nullable(), // Tel.
  email: model.text(), // Email

  // Gerät (device)
  kunden_nummer: model.text().nullable(), // Kunden-nummer
  geraete_nummer: model.text().nullable(), // Geräte-nummer

  anderer_empfaenger: model.boolean().default(false), // "anderer Empfänger" checkbox
  datum: model.text().nullable(), // Datum (top of form)

  beschreibung: model.text(), // Beschreibung (fault description)

  // Unterschrift (signature) block
  unterschrift_ort: model.text().nullable(),
  unterschrift_datum: model.text().nullable(),
  unterschrift: model.text().nullable(),

  // Meta (not on the PDF)
  sales_channel_id: model.text().nullable(),
  source_url: model.text().nullable(),
  locale: model.text().nullable(),
})

export default Reparatur
