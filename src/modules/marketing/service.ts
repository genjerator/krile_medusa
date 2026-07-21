import { MedusaService } from "@medusajs/framework/utils"
import CustomerCampaign from "./models/customer-campaign"
import MarketingProfile from "./models/marketing-profile"

class MarketingModuleService extends MedusaService({
  CustomerCampaign,
  MarketingProfile,
}) {}

export default MarketingModuleService
