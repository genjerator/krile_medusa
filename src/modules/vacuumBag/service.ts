import { MedusaService } from "@medusajs/framework/utils"
import VacuumBagColor from "./models/vacuum-bag-color"
import VacuumBagType from "./models/vacuum-bag-type"
import VacuumBagPrice from "./models/vacuum-bag-price"
import VacuumBagConfig from "./models/vacuum-bag-config"

class VacuumBagModuleService extends MedusaService({
  VacuumBagColor,
  VacuumBagType,
  VacuumBagPrice,
  VacuumBagConfig,
}) {}

export default VacuumBagModuleService
