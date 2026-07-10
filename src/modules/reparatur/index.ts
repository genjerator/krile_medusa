import { Module } from "@medusajs/framework/utils"
import ReparaturModuleService from "./service"

export const REPARATUR_MODULE = "reparatur"

export default Module(REPARATUR_MODULE, {
  service: ReparaturModuleService,
})
