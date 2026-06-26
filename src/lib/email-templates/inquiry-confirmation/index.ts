import { inquiryCustomerDe } from "./de"
import { inquiryCustomerEn } from "./en"
import { inquiryAdminDe } from "./admin"
import type { InquiryEmailData, EmailContent } from "./types"

export type { InquiryEmailData, EmailContent }

/**
 * Customer-facing inquiry email (confirmation + a copy of their submission),
 * selected by storefront locale: `en` → English, everything else → German.
 */
export function getInquiryCustomerEmail(
  locale: string | undefined,
  data: InquiryEmailData
): EmailContent {
  const isEnglish = (locale || "").toLowerCase().startsWith("en")
  return isEnglish ? inquiryCustomerEn(data) : inquiryCustomerDe(data)
}

/**
 * Admin/staff notification email. Always German (internal), lists everything
 * the customer submitted.
 */
export function getInquiryAdminEmail(data: InquiryEmailData): EmailContent {
  return inquiryAdminDe(data)
}
