import { MedusaService } from "@medusajs/framework/utils"
import NewsletterPreference from "./models/preference"

class NewsletterModuleService extends MedusaService({ NewsletterPreference }) {}

export default NewsletterModuleService
