export type EmailContent = { subject: string; html: string }

/** Everything a reparatur email (customer confirmation + staff notice) shows. */
export type ReparaturEmailData = {
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
  anderer_empfaenger: boolean
  beschreibung: string
  sourceUrl?: string | null
  dateStr: string
}
