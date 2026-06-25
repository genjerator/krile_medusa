export type InquiryConfirmationData = {
  /** Customer's name (may be empty). */
  name: string
  /** Store contact email used in the footer (may be empty). */
  storeEmail: string
}

export type EmailContent = {
  subject: string
  html: string
}
