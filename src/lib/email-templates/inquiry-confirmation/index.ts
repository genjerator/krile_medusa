import { inquiryConfirmationDe } from "./de"
import { inquiryConfirmationEn } from "./en"
import type { InquiryConfirmationData, EmailContent } from "./types"

export type { InquiryConfirmationData, EmailContent }

/**
 * Selects the inquiry-confirmation email template by storefront locale.
 * `en` → English, everything else (de/it/fr/ru/unset) → German.
 */
export function getInquiryConfirmationEmail(
  locale: string | undefined,
  data: InquiryConfirmationData
): EmailContent {
  const isEnglish = (locale || "").toLowerCase().startsWith("en")
  return isEnglish ? inquiryConfirmationEn(data) : inquiryConfirmationDe(data)
}
