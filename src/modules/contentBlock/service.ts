import { MedusaService } from "@medusajs/framework/utils"
import ContentBlock from "./models/content-block"

class ContentBlockModuleService extends MedusaService({
  ContentBlock,
}) {}

export default ContentBlockModuleService
