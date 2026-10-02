import { Module } from "@medusajs/framework/utils"
import SesEmailsModuleService from "./service"

export const SES_EMAILS_MODULE = "sesEmails"

export default Module(SES_EMAILS_MODULE, {
  service: SesEmailsModuleService,
})
