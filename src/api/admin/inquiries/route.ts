import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_INQUIRY_MODULE } from "../../../modules/productInquiry"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const inquiryService = req.scope.resolve(PRODUCT_INQUIRY_MODULE)
  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL)
  const productService = req.scope.resolve(Modules.PRODUCT)

  const limit = Number(req.query.limit) || 20
  const offset = Number(req.query.offset) || 0

  const [inquiries, count] = await inquiryService.listAndCountProductInquiries(
    {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  const salesChannelIds = [
    ...new Set(inquiries.map((i) => i.sales_channel_id).filter((id): id is string => !!id)),
  ]

  const salesChannels = salesChannelIds.length
    ? await salesChannelService.listSalesChannels({ id: salesChannelIds }, { select: ["id", "name"] })
    : []
  const salesChannelNames = Object.fromEntries(salesChannels.map((sc) => [sc.id, sc.name]))

  const productIds = [...new Set(inquiries.map((i) => i.product_id).filter((id): id is string => !!id))]

  const products = productIds.length
    ? await productService.listProducts({ id: productIds }, { select: ["id", "handle"] })
    : []
  const productHandles = Object.fromEntries(products.map((p) => [p.id, p.handle]))

  const inquiriesWithChannel = inquiries.map((inquiry) => ({
    ...inquiry,
    sales_channel_name: inquiry.sales_channel_id ? salesChannelNames[inquiry.sales_channel_id] ?? null : null,
    product_handle: productHandles[inquiry.product_id] ?? null,
  }))

  return res.json({ inquiries: inquiriesWithChannel, count, limit, offset })
}
