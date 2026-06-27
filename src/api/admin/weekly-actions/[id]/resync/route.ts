import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { resyncWeeklyActionPricesWorkflow } from "../../../../../workflows/weekly-action"

/** Recompute the sale price list for this weekly action from its stored rules. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const { result } = await resyncWeeklyActionPricesWorkflow(req.scope).run({
    input: { weekly_action_id: id },
  })

  return res.json({ weekly_action_id: id, ...result })
}
