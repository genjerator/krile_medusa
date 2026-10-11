import { model } from "@medusajs/framework/utils"

/**
 * A crafted cold-outreach email imported from the krile project (table
 * `company_emails`). One row per generated email; a company may have several.
 * See docs/company-outreach-system.md.
 *
 * `email_body` is PREBUILT HTML (generated in krile) — Medusa sends it as-is via
 * the Notification module (industries account); there is no render step. This is
 * a standalone outbox, DISTINCT from the SES campaign system (`ses_emails` /
 * `customer_campaign`).
 *
 * References to the company are stored as plain text (like `ses_emails.customer_id`),
 * NOT a formal module link: `company_id` = the Medusa `outreach_company.id`,
 * `company_external_id` = krile `companies.id` (kept so re-imports can re-resolve).
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`). The migration
 * CLASS NAME must be unique across ALL modules — Medusa shares one
 * `mikro_orm_migrations` table and a duplicate name silently baselines it.
 */
const OutreachEmail = model.define("outreach_email", {
  id: model.id().primaryKey(),
  external_id: model.text().unique(), // krile company_emails.id (uuid)
  company_id: model.text().nullable(), // outreach_company.id (Medusa id); null if unresolved
  company_external_id: model.text(), // krile companies.id (join key)
  to_email: model.text().nullable(), // denormalized recipient (company email)
  relevant_products: model.text().nullable(),
  reasoning: model.text().nullable(),
  subject: model.text().nullable(),
  email_body: model.text().nullable(), // prebuilt HTML
  // pending | queued | sending | sent | failed | skipped
  status: model.text().default("pending"),
  attempts: model.number().default(0),
  sent_at: model.dateTime().nullable(),
  error: model.text().nullable(),
  generated_at: model.dateTime().nullable(), // when krile crafted it (company_emails.created_at)
})

export default OutreachEmail
