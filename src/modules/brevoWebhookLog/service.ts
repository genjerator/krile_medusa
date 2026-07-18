import { MedusaService } from "@medusajs/framework/utils"
import BrevoWebhookLog from "./models/brevo-webhook-log"

class BrevoWebhookLogModuleService extends MedusaService({
  BrevoWebhookLog,
}) {}

export default BrevoWebhookLogModuleService
