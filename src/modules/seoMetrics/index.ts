import { Module } from "@medusajs/framework/utils"
import SeoMetricsModuleService from "./service"

export const SEO_METRICS_MODULE = "seoMetrics"

export default Module(SEO_METRICS_MODULE, {
  service: SeoMetricsModuleService,
})
