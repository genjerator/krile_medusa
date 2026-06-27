import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  updateWeeklyActionWorkflow,
  deleteWeeklyActionWorkflow,
} from "../../../../workflows/weekly-action"
import { UpdateWeeklyActionSchema } from "../validators"
import { revalidateStorefronts } from "../../../../lib/revalidate"

// Validated in-handler (not via middleware): a "/weekly-actions/:id" matcher
// would also shadow the sibling "/weekly-actions/generate-year" route.

const FIELDS = [
  "id",
  "title",
  "year",
  "iso_week",
  "starts_at",
  "ends_at",
  "status",
  "is_active",
  "default_discount_type",
  "default_discount_value",
  "price_list_id",
  "items.id",
  "items.product_id",
  "items.discount_type",
  "items.discount_value",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { id } = req.params

  const { data } = await query.graph({
    entity: "weekly_action",
    fields: FIELDS,
    filters: { id },
  })

  if (!data.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Weekly action ${id} not found`
    )
  }

  return res.json({ weekly_action: data[0] })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  const body = UpdateWeeklyActionSchema.parse(req.body)

  const { result } = await updateWeeklyActionWorkflow(req.scope).run({
    input: { id, ...body },
  })

  // Reflect edits to the live campaign on the storefront immediately.
  await revalidateStorefronts("weekly-action,products").catch(() => {})

  return res.json({ weekly_action: result })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  await deleteWeeklyActionWorkflow(req.scope).run({ input: { id } })

  await revalidateStorefronts("weekly-action,products").catch(() => {})

  return res.json({ id, object: "weekly_action", deleted: true })
}
