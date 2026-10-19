import { MedusaService } from "@medusajs/framework/utils"
import SocialAuthAccount from "./models/social-auth-account"

class BetterAuthModuleService extends MedusaService({
  SocialAuthAccount,
}) {}

export default BetterAuthModuleService
