import { Module } from "@medusajs/framework/utils"
import BrevoWebhookLogModuleService from "./service"

export const BREVO_WEBHOOK_LOG_MODULE = "brevoWebhookLog"

export default Module(BREVO_WEBHOOK_LOG_MODULE, {
  service: BrevoWebhookLogModuleService,
})
