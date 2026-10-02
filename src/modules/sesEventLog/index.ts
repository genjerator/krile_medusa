import { Module } from "@medusajs/framework/utils"
import SesEventLogModuleService from "./service"

export const SES_EVENT_LOG_MODULE = "sesEventLog"

export default Module(SES_EVENT_LOG_MODULE, {
  service: SesEventLogModuleService,
})
