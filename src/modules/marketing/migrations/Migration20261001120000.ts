import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds SES tracking columns to `customer_campaign` (the per-customer/per-campaign
 * engagement row), so SES events (source="ses") can be recorded alongside Brevo.
 *
 * Hand-written, column-only, with IF NOT EXISTS guards. Do NOT run
 * `medusa db:generate marketing` on the shared DB — it introspects every table
 * and emits `drop table` for the core schema (see reparatur migrations).
 */
export class Migration20261001120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_campaign" add column if not exists "ses_message_id" text null;`);
    this.addSql(`alter table if exists "customer_campaign" add column if not exists "delivered_at" timestamptz null;`);
    this.addSql(`alter table if exists "customer_campaign" add column if not exists "complained_at" timestamptz null;`);
    this.addSql(`alter table if exists "customer_campaign" add column if not exists "unsubscribed_at" timestamptz null;`);
    this.addSql(`create index if not exists "IDX_customer_campaign_ses_message_id" on "customer_campaign" ("ses_message_id") where "ses_message_id" is not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_customer_campaign_ses_message_id";`);
    this.addSql(`alter table if exists "customer_campaign" drop column if exists "ses_message_id";`);
    this.addSql(`alter table if exists "customer_campaign" drop column if exists "delivered_at";`);
    this.addSql(`alter table if exists "customer_campaign" drop column if exists "complained_at";`);
    this.addSql(`alter table if exists "customer_campaign" drop column if exists "unsubscribed_at";`);
  }

}
