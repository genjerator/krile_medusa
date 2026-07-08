import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createWeeklyActionWorkflow } from "../../../workflows/weekly-action"
import { CreateWeeklyActionSchema } from "./validators"
import { emailExists } from "../../../lib/email-templates/weekly-action/storage"

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
  "items.rank",
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data, metadata } = await query.graph({
    entity: "weekly_action",
    fields: FIELDS,
    pagination: { take: 200, skip: 0 },
  })

  const weekly_actions = [...data]
    .sort((a, b) => a.year - b.year || a.iso_week - b.iso_week)
    // Return items in the merchant-defined order, and flag which actions already
    // have a generated email file on disk (drives the list's "Preview" button).
    .map((a) => ({
      ...a,
      items: [...(a.items ?? [])].sort(
        (x: any, y: any) => (x.rank ?? 0) - (y.rank ?? 0)
      ),
      email_generated: emailExists(a.id),
    }))

  return res.json({ weekly_actions, count: metadata?.count ?? data.length })
}

export async function POST(
  req: MedusaRequest<CreateWeeklyActionSchema>,
  res: MedusaResponse
) {
  const { result } = await createWeeklyActionWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(201).json({ weekly_action: result })
}
