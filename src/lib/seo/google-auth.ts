import { JWT } from "google-auth-library"

/**
 * One Google service account (from SEO_GOOGLE_SA_JSON — raw JSON or base64) is
 * granted read access on both GA4 properties (Viewer) and both GSC properties
 * (user). We mint short-lived bearer tokens for the read-only scopes and call the
 * GA4 Data + Search Console REST APIs directly (no heavy googleapis bundle).
 */

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
]

let cachedClient: JWT | null = null

const parseServiceAccount = (): { client_email: string; private_key: string } => {
  const raw = process.env.SEO_GOOGLE_SA_JSON
  if (!raw) {
    throw new Error("SEO_GOOGLE_SA_JSON is not set")
  }
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8")
  const parsed = JSON.parse(json)
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("SEO_GOOGLE_SA_JSON missing client_email/private_key")
  }
  return parsed
}

export const hasGoogleCreds = () => Boolean(process.env.SEO_GOOGLE_SA_JSON)

const getClient = (): JWT => {
  if (cachedClient) return cachedClient
  const sa = parseServiceAccount()
  cachedClient = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: SCOPES,
  })
  return cachedClient
}

/** A valid OAuth2 bearer token for the read-only Google scopes. */
export const getGoogleAccessToken = async (): Promise<string> => {
  const client = getClient()
  const { token } = await client.getAccessToken()
  if (!token) throw new Error("Failed to obtain Google access token")
  return token
}
