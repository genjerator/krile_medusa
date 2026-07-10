import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { REPARATUR_MODULE } from "../../modules/reparatur"

export type CreateReparaturInput = {
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
  sales_channel_id?: string
  source_url?: string
  locale?: string
}

export const createReparaturStep = createStep(
  "create-reparatur-step",
  async (input: CreateReparaturInput, { container }) => {
    const service: any = container.resolve(REPARATUR_MODULE)
    const [row] = await service.createReparaturs([input])
    return new StepResponse(row, row.id)
  },
  async (id: string, { container }) => {
    if (!id) return
    const service: any = container.resolve(REPARATUR_MODULE)
    await service.deleteReparaturs(id)
  }
)
