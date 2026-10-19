import { Module } from "@medusajs/framework/utils"
import BetterAuthModuleService from "./service"

export const BETTER_AUTH_MODULE = "betterAuth"

export default Module(BETTER_AUTH_MODULE, {
  service: BetterAuthModuleService,
})
