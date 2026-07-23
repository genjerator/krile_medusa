import { MedusaService } from "@medusajs/framework/utils"
import StorefrontBranding from "./models/storefront-branding"

class StorefrontBrandingModuleService extends MedusaService({
  StorefrontBranding,
}) {}

export default StorefrontBrandingModuleService
