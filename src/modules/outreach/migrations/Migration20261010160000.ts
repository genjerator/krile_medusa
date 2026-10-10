import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `outreach_company` table — scraped B2B leads imported from the
 * krile project (see docs/company-outreach-system.md).
 *
 * Hand-written, scoped to this ONE table with IF NOT EXISTS guards. Do NOT
 * `medusa db:generate outreach` on the shared DB — it introspects every table and
 * emits `drop table` for the core schema (see the sesEmails / marketing migrations).
 *
 * NOTE: the migration CLASS NAME must be unique across ALL modules — Medusa shares
 * one `mikro_orm_migrations` table and matches by name, so a duplicate name (e.g.
 * marketing's Migration20261010120000) silently baselines this one without running.
 */
export class Migration20261010160000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "outreach_company" (
        "id" text not null,
        "external_id" text not null,
        "name" text not null,
        "category" text null,
        "street" text null,
        "postal_code" text null,
        "city" text null,
        "phone" text null,
        "website" text null,
        "email" text not null,
        "source_url" text null,
        "scraped_at" timestamptz null,
        "website_status" text null,
        "website_http_code" integer null,
        "website_detail" text null,
        "website_checked_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "outreach_company_pkey" primary key ("id")
      );
    `);
    this.addSql(`create unique index if not exists "IDX_outreach_company_external_id" on "outreach_company" ("external_id") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_outreach_company_deleted_at" on "outreach_company" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_outreach_company_city" on "outreach_company" ("city");`);
    this.addSql(`create index if not exists "IDX_outreach_company_email" on "outreach_company" ("email");`);
    this.addSql(`create index if not exists "IDX_outreach_company_name" on "outreach_company" ("name");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "outreach_company" cascade;`);
  }

}
