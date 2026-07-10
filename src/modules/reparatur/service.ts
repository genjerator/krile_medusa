import { MedusaService } from "@medusajs/framework/utils"
import Reparatur from "./models/reparatur"

class ReparaturModuleService extends MedusaService({
  Reparatur,
}) {}

export default ReparaturModuleService
