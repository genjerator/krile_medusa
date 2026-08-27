import { MedusaService } from "@medusajs/framework/utils"
import VacuumBagColor from "./models/vacuum-bag-color"
import VacuumBagPrice from "./models/vacuum-bag-price"
import VacuumBagConfig from "./models/vacuum-bag-config"

class VacuumBagModuleService extends MedusaService({
  VacuumBagColor,
  VacuumBagPrice,
  VacuumBagConfig,
}) {}

export default VacuumBagModuleService
