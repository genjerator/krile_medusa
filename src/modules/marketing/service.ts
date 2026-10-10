import { MedusaService } from "@medusajs/framework/utils"
import EmailCampaign from "./models/campaign"
import CustomerCampaign from "./models/customer-campaign"
import MarketingProfile from "./models/marketing-profile"

class MarketingModuleService extends MedusaService({
  EmailCampaign,
  CustomerCampaign,
  MarketingProfile,
}) {}

export default MarketingModuleService
