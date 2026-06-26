export type InquiryEmailData = {
  /** Customer's name (may be empty). */
  name: string
  /** Customer's email. */
  email: string
  /** Customer's phone (optional). */
  phone?: string
  /** The message the customer wrote. */
  message: string
  /** Product title when the inquiry is about a product (null for the contact form). */
  productLabel?: string | null
  /** Storefront link to the product (customer email). */
  productUrl?: string | null
  /** Admin link to the product (admin email). */
  adminProductUrl?: string | null
  /** Pre-formatted submission date/time. */
  dateStr: string
  /** Store contact email used in the customer footer (may be empty). */
  storeEmail: string
}

export type EmailContent = {
  subject: string
  html: string
}
