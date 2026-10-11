import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `outreach_email` table — crafted cold-outreach emails imported from
 * the krile project (table `company_emails`). See docs/company-outreach-system.md.
 *
 * Hand-written, scoped to this ONE table with IF NOT EXISTS guards. Do NOT
 * `medusa db:generate outreach`. The CLASS NAME is unique across the repo — a
 * duplicate name silently baselines the migration without running it.
 */
export class Migration20261011120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "outreach_email" (
        "id" text not null,
        "external_id" text not null,
        "company_id" text null,
        "company_external_id" text not null,
        "to_email" text null,
        "relevant_products" text null,
        "reasoning" text null,
        "subject" text null,
        "email_body" text null,
        "status" text not null default 'pending',
        "attempts" integer not null default 0,
        "sent_at" timestamptz null,
        "error" text null,
        "generated_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "outreach_email_pkey" primary key ("id")
      );
    `);
    this.addSql(`create unique index if not exists "IDX_outreach_email_external_id" on "outreach_email" ("external_id") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_outreach_email_deleted_at" on "outreach_email" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_outreach_email_company_id" on "outreach_email" ("company_id");`);
    this.addSql(`create index if not exists "IDX_outreach_email_company_external_id" on "outreach_email" ("company_external_id");`);
    this.addSql(`create index if not exists "IDX_outreach_email_status" on "outreach_email" ("status");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "outreach_email" cascade;`);
  }

}
