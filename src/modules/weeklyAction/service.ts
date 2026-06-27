import { MedusaService } from "@medusajs/framework/utils"
import WeeklyAction from "./models/weekly-action"
import WeeklyActionItem from "./models/weekly-action-item"

class WeeklyActionModuleService extends MedusaService({
  WeeklyAction,
  WeeklyActionItem,
}) {}

export default WeeklyActionModuleService
