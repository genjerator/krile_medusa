import { Module } from "@medusajs/framework/utils"
import VacuumBagModuleService from "./service"

export const VACUUM_BAG_MODULE = "vacuumBag"

export default Module(VACUUM_BAG_MODULE, {
  service: VacuumBagModuleService,
})
