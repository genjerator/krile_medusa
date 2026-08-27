import { MedusaService } from "@medusajs/framework/utils"
import SeoMetricDaily from "./models/seo-metric-daily"
import SeoQueryDaily from "./models/seo-query-daily"
import SeoPageDaily from "./models/seo-page-daily"

class SeoMetricsModuleService extends MedusaService({
  SeoMetricDaily,
  SeoQueryDaily,
  SeoPageDaily,
}) {}

export default SeoMetricsModuleService
