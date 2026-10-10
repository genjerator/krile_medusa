import { model } from "@medusajs/framework/utils"

/**
 * A scraped B2B lead imported from the `krile` project (Go scraper, local
 * Postgres `krile`, table `companies`). This is the Medusa home for cold-outreach
 * prospects — DISTINCT from `customer` and from the SES campaign system
 * (`ses_emails` / `customer_campaign`). See docs/company-outreach-system.md.
 *
 * `external_id` holds krile's integer `companies.id` (as text) so re-imports are
 * idempotent and the future `outreach_email` rows can join back.
 *
 * Table created by a HAND-WRITTEN migration (never `db:generate`, which drops the
 * shared DB's core tables — see the sesEmails / marketing migrations).
 */
const OutreachCompany = model.define("outreach_company", {
  id: model.id().primaryKey(),
  external_id: model.text().unique(), // krile companies.id (as string)
  name: model.text(),
  category: model.text().nullable(),
  street: model.text().nullable(),
  postal_code: model.text().nullable(),
  city: model.text().nullable(),
  phone: model.text().nullable(),
  website: model.text().nullable(),
  email: model.text(), // import filters to non-empty
  source_url: model.text().nullable(),
  scraped_at: model.dateTime().nullable(),
  website_status: model.text().nullable(),
  website_http_code: model.number().nullable(),
  website_detail: model.text().nullable(),
  website_checked_at: model.dateTime().nullable(),
})

export default OutreachCompany
