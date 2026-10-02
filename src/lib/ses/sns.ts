import crypto from "crypto"

/**
 * Amazon SNS message helpers for the SES event webhook.
 *
 * SNS POSTs a JSON envelope (Type = Notification | SubscriptionConfirmation |
 * UnsubscribeConfirmation). We verify the message signature against the AWS
 * signing certificate before trusting it, and confirm the HTTPS subscription by
 * fetching the SubscribeURL. The actual SES event is the `Message` string of a
 * Notification (parsed by the caller).
 *
 * Signature verification can be disabled for local testing with
 * `SES_SNS_SKIP_VERIFY=true` (never set that in production).
 */

export type SnsMessage = {
  Type: string
  MessageId?: string
  Token?: string
  TopicArn?: string
  Subject?: string
  Message?: string
  Timestamp?: string
  SubscribeURL?: string
  Signature?: string
  SignatureVersion?: string
  SigningCertURL?: string
}

// SNS signs these fields, in this exact order, joined as "<key>\n<value>\n".
const SIGNED_FIELDS: Record<string, string[]> = {
  Notification: ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"],
  SubscriptionConfirmation: ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"],
  UnsubscribeConfirmation: ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"],
}

const CERT_HOST = /^sns\.[a-z0-9-]+\.amazonaws\.com$/
const certCache = new Map<string, string>()

function assertAwsHttps(raw: string | undefined, hostCheck: (h: string) => boolean): URL {
  if (!raw) throw new Error("missing URL")
  const u = new URL(raw)
  if (u.protocol !== "https:" || !hostCheck(u.hostname)) {
    throw new Error(`refusing untrusted SNS URL: ${raw}`)
  }
  return u
}

async function getSigningCert(url: string): Promise<string> {
  assertAwsHttps(url, (h) => CERT_HOST.test(h))
  const cached = certCache.get(url)
  if (cached) return cached
  const res = await fetch(url)
  if (!res.ok) throw new Error(`SNS cert fetch failed: ${res.status}`)
  const pem = await res.text()
  certCache.set(url, pem)
  return pem
}

/** Verify the SNS message signature against the AWS signing certificate. */
export async function verifySnsMessage(msg: SnsMessage): Promise<boolean> {
  if (process.env.SES_SNS_SKIP_VERIFY === "true") return true

  const fields = SIGNED_FIELDS[msg.Type]
  if (!fields || !msg.Signature || !msg.SigningCertURL) return false

  let canonical = ""
  for (const f of fields) {
    const v = (msg as Record<string, unknown>)[f]
    if (v === undefined || v === null) continue
    canonical += `${f}\n${v}\n`
  }

  const cert = await getSigningCert(msg.SigningCertURL)
  const algorithm = msg.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1"
  const verifier = crypto.createVerify(algorithm)
  verifier.update(canonical, "utf8")
  try {
    return verifier.verify(cert, msg.Signature, "base64")
  } catch {
    return false
  }
}

/** Confirm an HTTPS subscription by fetching its (AWS-hosted) SubscribeURL. */
export async function confirmSnsSubscription(msg: SnsMessage): Promise<void> {
  assertAwsHttps(msg.SubscribeURL, (h) => h.endsWith(".amazonaws.com"))
  const res = await fetch(msg.SubscribeURL as string)
  if (!res.ok) throw new Error(`SNS subscription confirm failed: ${res.status}`)
}
