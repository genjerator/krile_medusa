import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `ses_emails` outbox table (per-recipient intent-to-send, ref-based).
 *
 * Hand-written, scoped to this ONE table with IF NOT EXISTS guards. Do NOT
 * `medusa db:generate sesEmails` on the shared DB — it introspects every table and
 * emits `drop table` for the core schema (see the marketing / sesEventLog migrations).
 */
export class Migration20261002120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "ses_emails" (
        "id" text not null,
        "batch_id" text null,
        "source_type" text not null,
        "source_id" text not null,
        "customer_id" text not null,
        "to_email" text not null,
        "data" jsonb null,
        "status" text not null default 'pending',
        "ses_message_id" text null,
        "error" text null,
        "attempts" integer not null default 0,
        "generated_at" timestamptz null,
        "sent_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ses_emails_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_ses_emails_deleted_at" on "ses_emails" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_ses_emails_batch_id" on "ses_emails" ("batch_id");`);
    this.addSql(`create index if not exists "IDX_ses_emails_source" on "ses_emails" ("source_type", "source_id");`);
    this.addSql(`create index if not exists "IDX_ses_emails_status" on "ses_emails" ("status");`);
    this.addSql(`create index if not exists "IDX_ses_emails_customer_id" on "ses_emails" ("customer_id");`);
    this.addSql(`create index if not exists "IDX_ses_emails_ses_message_id" on "ses_emails" ("ses_message_id") where "ses_message_id" is not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ses_emails" cascade;`);
  }

}
