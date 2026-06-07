import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createProductInquiryStep } from "./steps/create-product-inquiry"

type Input = {
  product_id: string
  email: string
  name: string
  message: string
  phone?: string
}

const createProductInquiryWorkflow = createWorkflow(
  "create-product-inquiry",
  function (input: Input) {
    const inquiry = createProductInquiryStep(input)
    return new WorkflowResponse(inquiry)
  }
)

export default createProductInquiryWorkflow
