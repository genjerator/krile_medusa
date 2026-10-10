import { Module } from "@medusajs/framework/utils"
import OutreachModuleService from "./service"

export const OUTREACH_MODULE = "outreach"

export default Module(OUTREACH_MODULE, {
  service: OutreachModuleService,
})
