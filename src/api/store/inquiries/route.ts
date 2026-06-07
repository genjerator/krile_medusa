import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createProductInquiryWorkflow from "../../../workflows/create-product-inquiry"
import { CreateInquirySchema } from "./middlewares"

export async function POST(
  req: MedusaRequest<CreateInquirySchema>,
  res: MedusaResponse
) {
  const input = req.validatedBody ?? req.body
  const { result } = await createProductInquiryWorkflow(req.scope).run({
    input,
  })
  return res.status(201).json({ inquiry: result })
}
