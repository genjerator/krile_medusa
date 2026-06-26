import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { createProductInquiryStep } from "./steps/create-product-inquiry"
import { linkInquiryToCustomerStep } from "./steps/link-inquiry-customer"
import { sendInquiryConfirmationStep } from "./steps/send-inquiry-confirmation"

type Input = {
  product_id: string
  email: string
  name: string
  message: string
  phone?: string
  sales_channel_ids?: string[]
  locale?: string
  source_url?: string
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

    // Send the customer a confirmation email (best-effort; never rolls back the inquiry).
    const confirmationInput = transform({ input }, ({ input }) => ({
      email: input.email,
      name: input.name,
      message: input.message,
      phone: input.phone,
      locale: input.locale,
      product_id: input.product_id,
      source_url: input.source_url,
      sales_channel_ids: input.sales_channel_ids,
    }))
    sendInquiryConfirmationStep(confirmationInput)

    return new WorkflowResponse(inquiry)
  }
)

export default createProductInquiryWorkflow
