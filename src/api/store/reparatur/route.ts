import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import createReparaturWorkflow from "../../../workflows/create-reparatur"
import { CreateReparaturSchema } from "./validators"

export async function POST(
  req: MedusaStoreRequest<CreateReparaturSchema>,
  res: MedusaResponse
) {
  const input = {
    ...req.validatedBody,
    sales_channel_ids: req.publishable_key_context?.sales_channel_ids,
  }
  const { result } = await createReparaturWorkflow(req.scope).run({ input })
  return res.status(201).json({ reparatur: result })
}
