import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types"
import { getAuth } from "../../lib/better-auth/auth"

type InjectedDependencies = {
  logger: Logger
}

/**
 * Medusa auth provider that BRIDGES Better Auth into Medusa's native auth.
 *
 * Better Auth performs the actual login (email+password, Google, Facebook) at
 * `/better-auth/*` and keeps the resulting session in its own `ba_session`
 * cookie. The storefront then calls `POST /auth/customer/better-auth`, which
 * routes here: we read the Better Auth session from the incoming request,
 * validate it, and map the Better Auth user onto a Medusa auth identity so
 * Medusa can issue its own customer token.
 *
 * There is no redirect dance in this provider — Better Auth already handled the
 * OAuth callback. This is a pure "exchange the Better Auth session for a Medusa
 * identity" step, so `validateCallback` simply delegates to `authenticate`.
 */
export class BetterAuthProviderService extends AbstractAuthModuleProvider {
  static identifier = "better-auth"
  static DISPLAY_NAME = "Better Auth"

  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options?: Record<string, unknown>) {
    // @ts-ignore - mirror the signature of Medusa's built-in auth providers
    super(...arguments)
    this.logger_ = logger
  }

  private async resolveFromSession(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    try {
      const headers = new Headers()
      for (const [key, value] of Object.entries(data.headers ?? {})) {
        if (typeof value === "string") {
          headers.set(key, value)
        }
      }

      const auth = await getAuth()
      const result = await auth.api.getSession({ headers })

      if (!result?.user) {
        return { success: false, error: "No active Better Auth session" }
      }

      const { user } = result
      const entity_id = user.id
      const userMetadata = {
        email: user.email,
        name: user.name,
        image: user.image,
        email_verified: user.emailVerified,
      }

      let authIdentity
      try {
        authIdentity = await authIdentityService.retrieve({ entity_id })
      } catch (error: any) {
        if (error.type === MedusaError.Types.NOT_FOUND) {
          authIdentity = await authIdentityService.create({
            entity_id,
            user_metadata: userMetadata,
          })
        } else {
          return { success: false, error: error.message }
        }
      }

      return { success: true, authIdentity }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.resolveFromSession(data, authIdentityService)
  }

  // Better Auth owns the OAuth callback, so by the time Medusa is called a
  // session already exists — treat a callback hit the same as authenticate.
  async validateCallback(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    return this.resolveFromSession(data, authIdentityService)
  }

  // Registration happens inside Better Auth (sign-up / social consent), not
  // through Medusa's auth provider.
  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration is handled by Better Auth. Use the Better Auth sign-up/sign-in flow, then exchange the session via `authenticate`."
    )
  }
}
