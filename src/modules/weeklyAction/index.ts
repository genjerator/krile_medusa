import { Module } from "@medusajs/framework/utils"
import WeeklyActionModuleService from "./service"

export const WEEKLY_ACTION_MODULE = "weeklyAction"

export default Module(WEEKLY_ACTION_MODULE, {
  service: WeeklyActionModuleService,
})
