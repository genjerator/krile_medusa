import { Module } from "@medusajs/framework/utils"
import SesBatchModuleService from "./service"

export const SES_BATCH_MODULE = "sesBatch"

export default Module(SES_BATCH_MODULE, {
  service: SesBatchModuleService,
})
