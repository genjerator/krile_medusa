import crypto from "crypto"

/**
 * Signed, URL-safe unsubscribe tokens. A token encodes the customer id (and
 * optionally the campaign it came from) and is HMAC-signed with
 * `MARKETING_UNSUBSCRIBE_SECRET`, so the unsubscribe link needs no login and
 * cannot be forged. There is intentionally NO expiry — unsubscribe links must
 * work indefinitely (legal requirement).
 */

type Payload = { c: string; k: string | null }

function secret(): string {
  const s = process.env.MARKETING_UNSUBSCRIBE_SECRET
  if (!s) throw new Error("MARKETING_UNSUBSCRIBE_SECRET is not set")
  return s
}

function hmac(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url")
}

export function signUnsubscribeToken(customerId: string, campaignId?: string | null): string {
  const payload: Payload = { c: customerId, k: campaignId ?? null }
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${data}.${hmac(data)}`
}

export function verifyUnsubscribeToken(
  token: string | undefined | null
): { customerId: string; campaignId: string | null } | null {
  if (!token || typeof token !== "string") return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expected = hmac(data)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Payload
    if (!p.c || typeof p.c !== "string") return null
    return { customerId: p.c, campaignId: p.k ?? null }
  } catch {
    return null
  }
}
