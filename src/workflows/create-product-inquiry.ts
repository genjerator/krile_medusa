import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { createProductInquiryStep } from "./steps/create-product-inquiry"
import { linkInquiryToCustomerStep } from "./steps/link-inquiry-customer"

type Input = {
  product_id: string
  email: string
  name: string
  message: string
  phone?: string
  sales_channel_ids?: string[]
}

const createProductInquiryWorkflow = createWorkflow(
  "create-product-inquiry",
  function (input: Input) {
    const inquiryInput = transform({ input }, ({ input }) => ({
      product_id: input.product_id,
      email: input.email,
      name: input.name,
      message: input.message,
      phone: input.phone,
      sales_channel_id: input.sales_channel_ids?.[0],
    }))

    const inquiry = createProductInquiryStep(inquiryInput)

    const customerInput = transform({ input }, ({ input }) => ({
      email: input.email,
      name: input.name,
      phone: input.phone,
      source: input.product_id === "contact-form" ? "contact-form" : "product-inquiry",
      sales_channel_ids: input.sales_channel_ids,
    }))

    linkInquiryToCustomerStep(customerInput)

    return new WorkflowResponse(inquiry)
  }
)

export default createProductInquiryWorkflow
