import { MedusaResponse, MedusaStoreRequest } from "@medusajs/framework/http"
import createProductInquiryWorkflow from "../../../workflows/create-product-inquiry"
import { CreateInquirySchema } from "../../middlewares"

export async function POST(
  req: MedusaStoreRequest<CreateInquirySchema>,
  res: MedusaResponse
) {
  // Honeypot: a real user never fills the hidden `website` field. If it's set,
  // it's a bot — silently pretend success (201) so it doesn't retry/adapt, and
  // create NO customer, inquiry, or email.
  if ((req.validatedBody.website ?? "").trim() !== "") {
    return res.status(201).json({ inquiry: null })
  }

  const { website, ...rest } = req.validatedBody
  const input = {
    ...rest,
    sales_channel_ids: req.publishable_key_context?.sales_channel_ids,
  }
  const { result } = await createProductInquiryWorkflow(req.scope).run({
    input,
  })
  return res.status(201).json({ inquiry: result })
}
