import { Module } from "@medusajs/framework/utils"
import CookieConsentModuleService from "./service"

export const COOKIE_CONSENT_MODULE = "cookieConsent"

export default Module(COOKIE_CONSENT_MODULE, {
  service: CookieConsentModuleService,
})
