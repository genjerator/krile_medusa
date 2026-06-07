import { model } from "@medusajs/framework/utils"

const ProductInquiry = model.define("product_inquiry", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  email: model.text(),
  name: model.text(),
  message: model.text(),
  phone: model.text().nullable(),
  sales_channel_id: model.text().nullable(),
})

export default ProductInquiry
