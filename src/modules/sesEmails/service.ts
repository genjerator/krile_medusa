import { MedusaService } from "@medusajs/framework/utils"
import SesEmail from "./models/ses-email"

class SesEmailsModuleService extends MedusaService({
  SesEmail,
}) {}

export default SesEmailsModuleService
