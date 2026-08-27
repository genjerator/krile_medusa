import { MedusaService } from "@medusajs/framework/utils"
import CookieConsentDaily from "./models/cookie-consent-daily"

class CookieConsentModuleService extends MedusaService({
  CookieConsentDaily,
}) {}

export default CookieConsentModuleService
