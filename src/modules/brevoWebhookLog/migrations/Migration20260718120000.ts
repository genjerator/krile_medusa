import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `brevo_webhook_log` audit table for the Brevo marketing webhook.
 *
 * Hand-written and scoped to this ONE table with IF NOT EXISTS guards. Do NOT
 * regenerate via `medusa db:generate brevoWebhookLog`: on this shared database
 * the generator introspects every table and emits `drop table` for the core
 * schema (it wiped the DB once — see reparatur's migrations and
 * docs/RDS_RESTORE_LOCAL.md). Add/adjust columns by hand only.
 */
export class Migration20260718120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "brevo_webhook_log" (
        "id" text not null,
        "event" text null,
        "email" text null,
        "campaign_id" integer null,
        "matched" boolean not null default false,
        "payload" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "brevo_webhook_log_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_brevo_webhook_log_deleted_at" on "brevo_webhook_log" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_brevo_webhook_log_email" on "brevo_webhook_log" ("email");`);
    this.addSql(`create index if not exists "IDX_brevo_webhook_log_created_at" on "brevo_webhook_log" ("created_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "brevo_webhook_log" cascade;`);
  }

}
