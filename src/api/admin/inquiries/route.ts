import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_INQUIRY_MODULE } from "../../../modules/productInquiry"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const inquiryService = req.scope.resolve(PRODUCT_INQUIRY_MODULE)

  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  const [inquiries, count] = await inquiryService.listAndCountProductInquiries(
    {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  return res.json({ inquiries, count, limit, offset })
}
