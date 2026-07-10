import { reparaturCustomerDe } from "./de"
import { reparaturCustomerEn } from "./en"
import { reparaturAdminDe } from "./admin"
import type { ReparaturEmailData, EmailContent } from "./types"

export type { ReparaturEmailData, EmailContent }

/**
 * Customer-facing confirmation email, selected by storefront locale:
 * `en` → English, everything else → German.
 */
export function getReparaturCustomerEmail(
  locale: string | undefined,
  data: ReparaturEmailData
): EmailContent {
  const isEnglish = (locale || "").toLowerCase().startsWith("en")
  return isEnglish ? reparaturCustomerEn(data) : reparaturCustomerDe(data)
}

/** Staff notification email. Always German, lists everything submitted. */
export function getReparaturAdminEmail(data: ReparaturEmailData): EmailContent {
  return reparaturAdminDe(data)
}
