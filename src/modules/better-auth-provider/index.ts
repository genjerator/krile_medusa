import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { BetterAuthProviderService } from "./service"

/**
 * Registers the Better Auth bridge as an auth provider on Medusa's Auth module.
 * Its identifier is "better-auth", so the storefront exchanges a Better Auth
 * session for a Medusa customer token via `POST /auth/customer/better-auth`.
 */
export default ModuleProvider(Modules.AUTH, {
  services: [BetterAuthProviderService],
})
