import { MedusaService } from "@medusajs/framework/utils"
import OutreachCompany from "./models/outreach-company"

class OutreachModuleService extends MedusaService({
  OutreachCompany,
}) {}

export default OutreachModuleService
