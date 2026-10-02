import { MedusaService } from "@medusajs/framework/utils"
import SesEventLog from "./models/ses-event-log"

class SesEventLogModuleService extends MedusaService({
  SesEventLog,
}) {}

export default SesEventLogModuleService
