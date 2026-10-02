import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `ses_event_log` audit table for incoming SES events (via SNS).
 *
 * Hand-written, scoped to this ONE table with IF NOT EXISTS guards. Do NOT
 * regenerate via `medusa db:generate sesEventLog`: on this shared database the
 * generator introspects every table and emits `drop table` for the core schema
 * (it wiped the DB once — see the marketing / reparatur migrations).
 */
export class Migration20261001121000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "ses_event_log" (
        "id" text not null,
        "event" text null,
        "email" text null,
        "message_id" text null,
        "campaign_id" text null,
        "matched" boolean not null default false,
        "payload" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ses_event_log_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_ses_event_log_deleted_at" on "ses_event_log" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_ses_event_log_email" on "ses_event_log" ("email");`);
    this.addSql(`create index if not exists "IDX_ses_event_log_message_id" on "ses_event_log" ("message_id");`);
    this.addSql(`create index if not exists "IDX_ses_event_log_created_at" on "ses_event_log" ("created_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ses_event_log" cascade;`);
  }

}
