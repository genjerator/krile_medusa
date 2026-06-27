import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generateWeeklyActionYearWorkflow } from "../../../../workflows/weekly-action"
import { GenerateYearSchema } from "../validators"

/** Scaffold the 52 draft weekly-action slots for a year (skips existing weeks). */
export async function POST(
  req: MedusaRequest<GenerateYearSchema>,
  res: MedusaResponse
) {
  const { result } = await generateWeeklyActionYearWorkflow(req.scope).run({
    input: { year: req.validatedBody.year },
  })

  return res.status(201).json(result)
}
