import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { createReparaturStep } from "./steps/create-reparatur"
import { linkReparaturToCustomerStep } from "./steps/link-reparatur-customer"
import { sendReparaturConfirmationStep } from "./steps/send-reparatur-confirmation"

type Input = {
  kd_nr?: string
  name: string
  vorname: string
  kontakt?: string
  strasse_nr: string
  plz: string
  ort: string
  land: string
  tel?: string
  email: string
  kunden_nummer?: string
  geraete_nummer?: string
  anderer_empfaenger?: boolean
  datum?: string
  beschreibung: string
  unterschrift_ort?: string
  unterschrift_datum?: string
  unterschrift?: string
  sales_channel_ids?: string[]
  locale?: string
  source_url?: string
}

const createReparaturWorkflow = createWorkflow(
  "create-reparatur",
  function (input: Input) {
    const reparaturInput = transform({ input }, ({ input }) => ({
      kd_nr: input.kd_nr,
      name: input.name,
      vorname: input.vorname,
      kontakt: input.kontakt,
      strasse_nr: input.strasse_nr,
      plz: input.plz,
      ort: input.ort,
      land: input.land,
      tel: input.tel,
      email: input.email,
      kunden_nummer: input.kunden_nummer,
      geraete_nummer: input.geraete_nummer,
      anderer_empfaenger: input.anderer_empfaenger,
      datum: input.datum,
      beschreibung: input.beschreibung,
      unterschrift_ort: input.unterschrift_ort,
      unterschrift_datum: input.unterschrift_datum,
      unterschrift: input.unterschrift,
      sales_channel_id: input.sales_channel_ids?.[0],
      source_url: input.source_url,
      locale: input.locale,
    }))

    const reparatur = createReparaturStep(reparaturInput)

    // Create the customer if they don't exist yet, and link to the storefront's channel.
    const customerInput = transform({ input }, ({ input }) => ({
      email: input.email,
      vorname: input.vorname,
      name: input.name,
      phone: input.tel,
      sales_channel_ids: input.sales_channel_ids,
    }))
    linkReparaturToCustomerStep(customerInput)

    // Best-effort emails (customer confirmation + staff notice); never rolls back.
    const emailInput = transform({ input }, ({ input }) => ({
      kd_nr: input.kd_nr,
      name: input.name,
      vorname: input.vorname,
      kontakt: input.kontakt,
      strasse_nr: input.strasse_nr,
      plz: input.plz,
      ort: input.ort,
      land: input.land,
      tel: input.tel,
      email: input.email,
      kunden_nummer: input.kunden_nummer,
      geraete_nummer: input.geraete_nummer,
      anderer_empfaenger: input.anderer_empfaenger,
      beschreibung: input.beschreibung,
      locale: input.locale,
      source_url: input.source_url,
      sales_channel_ids: input.sales_channel_ids,
    }))
    sendReparaturConfirmationStep(emailInput)

    return new WorkflowResponse(reparatur)
  }
)

export default createReparaturWorkflow
