import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `campaign` table (marketing module) — the first-class email campaign
 * that owns a weekly action, a subject override, and a set of customer-group sends.
 *
 * Hand-written with IF NOT EXISTS guards. Do NOT run `medusa db:generate marketing`
 * on this shared DB — it introspects every table and emits `drop table` for the
 * core schema (see the sibling marketing migrations).
 */
export class Migration20261010120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "email_campaign" (
        "id" text not null,
        "name" text not null,
        "weekly_action_id" text not null,
        "subject" text null,
        "status" text not null default 'draft',
        "scheduled_at" timestamptz null,
        "sent_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "email_campaign_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_email_campaign_deleted_at" on "email_campaign" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_email_campaign_weekly_action_id" on "email_campaign" ("weekly_action_id");`);
    this.addSql(`create index if not exists "IDX_email_campaign_status" on "email_campaign" ("status");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "email_campaign" cascade;`);
  }

}
