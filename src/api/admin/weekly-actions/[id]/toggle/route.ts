import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { toggleWeeklyActionWorkflow } from "../../../../../workflows/weekly-action"
import { revalidateStorefronts } from "../../../../../lib/revalidate"

const ToggleSchema = z.object({ active: z.boolean() })

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { active } = ToggleSchema.parse(req.body)

  const { result } = await toggleWeeklyActionWorkflow(req.scope).run({
    input: { id, active },
  })

  // Bust the storefront caches so the switch shows up immediately: the campaign
  // visibility (`weekly-action`) and the sale was/now prices (`products`).
  await revalidateStorefronts("weekly-action,products").catch(() => {})

  return res.json({ weekly_action: result })
}
