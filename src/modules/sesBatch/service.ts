import { MedusaService } from "@medusajs/framework/utils"
import SesBatch from "./models/ses-batch"

class SesBatchModuleService extends MedusaService({
  SesBatch,
}) {}

export default SesBatchModuleService
