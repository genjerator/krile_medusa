import { model } from "@medusajs/framework/utils"

const NewsletterPreference = model.define("newsletter_preference", {
  id:          model.id().primaryKey(),
  customer_id: model.text().unique(),
  subscribed:  model.boolean().default(false),
})

export default NewsletterPreference
