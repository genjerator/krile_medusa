import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_INQUIRY_MODULE } from "../../modules/productInquiry"

type Input = {
  product_id: string
  email: string
  name: string
  message: string
  phone?: string
}

export const createProductInquiryStep = createStep(
  "create-product-inquiry-step",
  async (input: Input, { container }) => {
    const productInquiryService = container.resolve(PRODUCT_INQUIRY_MODULE)

    const [inquiry] = await productInquiryService.createProductInquiries([input])

    return new StepResponse(inquiry, inquiry.id)
  },
  async (id: string, { container }) => {
    if (!id) return
    const productInquiryService = container.resolve(PRODUCT_INQUIRY_MODULE)
    await productInquiryService.deleteProductInquiries(id)
  }
)
