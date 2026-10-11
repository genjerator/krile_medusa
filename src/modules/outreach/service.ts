import { MedusaService } from "@medusajs/framework/utils"
import OutreachCompany from "./models/outreach-company"
import OutreachEmail from "./models/outreach-email"

class OutreachModuleService extends MedusaService({
  OutreachCompany,
  OutreachEmail,
}) {}

export default OutreachModuleService
