import { Module } from "@medusajs/framework/utils"
import StorefrontBrandingModuleService from "./service"

export const STOREFRONT_BRANDING_MODULE = "storefrontBranding"

export default Module(STOREFRONT_BRANDING_MODULE, {
  service: StorefrontBrandingModuleService,
})
