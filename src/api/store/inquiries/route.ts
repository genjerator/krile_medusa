import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import createProductInquiryWorkflow from "../../../workflows/create-product-inquiry"
import { CreateInquirySchema } from "../../middlewares"

export async function POST(
  req: MedusaStoreRequest<CreateInquirySchema>,
  res: MedusaResponse
) {
  const input = {
    ...req.validatedBody,
    sales_channel_ids: req.publishable_key_context?.sales_channel_ids,
  }
  const { result } = await createProductInquiryWorkflow(req.scope).run({
    input,
  })
  return res.status(201).json({ inquiry: result })
}
