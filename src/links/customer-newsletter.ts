import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import NewsletterModule from "../modules/newsletter"

export default defineLink(
  CustomerModule.linkable.customer,
  NewsletterModule.linkable.newsletterPreference
)
