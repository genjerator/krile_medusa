import { Pool } from "pg"

/**
 * Better Auth instance — the authentication ENGINE that sits behind the
 * storefront login. It runs inside the Medusa server, mounted at `/better-auth/*`
 * (see `src/api/better-auth/[...all]/route.ts`), and keeps its own tables in the
 * same Postgres database. A thin Medusa auth provider (`src/modules/better-auth-provider`)
 * then validates a Better Auth session and lets Medusa issue its own native token.
 *
 * Loaded via dynamic `import()`: `better-auth` is an ESM-only package, while the
 * Medusa backend compiles to CommonJS. A static import would emit a `require()`
 * that cannot load ESM (TS1479); a dynamic import is preserved as a real ESM
 * import under `module: "Node16"` and is resolved on first use. Initialising
 * lazily also keeps Better Auth from connecting to Postgres at build time.
 *
 * IMPORTANT — table names are prefixed with `ba_`.
 * Better Auth's default table names include `user`, `session`, `account` and
 * `verification`. Medusa ALREADY owns a core `user` table (admin users), so the
 * defaults would collide. The `modelName` overrides below keep every Better Auth
 * table under the `ba_` namespace. These tables are created by a hand-written
 * Medusa migration (never by Better Auth's own `migrate` CLI) — see
 * `src/modules/betterAuth/migrations`.
 */

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

let authPromise: Promise<Awaited<ReturnType<typeof build>>> | null = null

async function build() {
  const { betterAuth } = await import("better-auth")

  // Reuse the main Medusa Postgres. The Pool opens no connection until the
  // first query.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  return betterAuth({
    database: pool,

    // Public URL of the BACKEND (where Better Auth is mounted). Used to build
    // correct OAuth callback URLs. In production set BETTER_AUTH_URL to the
    // backend origin, e.g. https://api.planeta-shop.de
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:9000",
    basePath: "/better-auth",

    // Falls back to JWT_SECRET so local dev works without extra config.
    secret: process.env.BETTER_AUTH_SECRET ?? process.env.JWT_SECRET,

    // Storefront origins allowed to start the auth flow (comma-separated env).
    trustedOrigins,

    emailAndPassword: {
      enabled: true,
    },

    socialProviders: {
      // Each provider is only enabled when its credentials are present,
      // mirroring how the SMTP shop account is conditionally registered. This
      // keeps the engine working locally before the OAuth apps exist (Phase 3).
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
      ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
        ? {
            facebook: {
              clientId: process.env.FACEBOOK_CLIENT_ID,
              clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            },
          }
        : {}),
    },

    // Account-linking policy: "link on verified email".
    // Google and Facebook report provider-verified emails, so we trust them to
    // link into an existing account with the same email. Email/password
    // accounts link only once their email is verified (Better Auth default).
    account: {
      modelName: "ba_account",
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook"],
      },
    },

    user: { modelName: "ba_user" },
    session: { modelName: "ba_session" },
    verification: { modelName: "ba_verification" },
  })
}

/**
 * Returns the shared Better Auth instance, building it on first call. Both the
 * mount middleware and the Medusa auth provider resolve the same singleton.
 */
export function getAuth() {
  if (!authPromise) {
    authPromise = build()
  }
  return authPromise
}

export type BetterAuthInstance = Awaited<ReturnType<typeof getAuth>>

let handlerPromise: Promise<(req: any, res: any) => unknown> | null = null

/**
 * Returns a Node/Express-style handler for Better Auth, built once. Mounted as a
 * terminating middleware on `/better-auth/*` in `src/api/middlewares.ts` —
 * Medusa's file-router has no catch-all (`[...all]`) support, so a wildcard
 * middleware is how we serve all of Better Auth's sub-paths. `toNodeHandler` is
 * ESM-only, hence the dynamic import.
 */
export function getBetterAuthNodeHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const { toNodeHandler } = await import("better-auth/node")
      const auth = await getAuth()
      return toNodeHandler(auth)
    })()
  }
  return handlerPromise
}
