import { model } from "@medusajs/framework/utils"

const ProductInquiry = model.define("product_inquiry", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  email: model.text(),
  name: model.text(),
  message: model.text(),
  phone: model.text().nullable(),
  sales_channel_id: model.text().nullable(),
  // Branded-bag configurator: customer logo artwork (S3 url), a flattened
  // preview image, the logo's original filename, and the chosen placement +
  // bag options (type/color/size) as JSON. All null for ordinary inquiries.
  logo_url: model.text().nullable(),
  logo_name: model.text().nullable(),
  preview_url: model.text().nullable(),
  details: model.json().nullable(),
})

export default ProductInquiry
