import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates the `marketing` module tables: customer_campaign (per-customer campaign
 * membership/engagement) and marketing_profile (1:1 per customer — unsubscribe +
 * priority).
 *
 * Hand-written with IF NOT EXISTS guards. Do NOT run `medusa db:generate marketing`
 * on this shared DB — it introspects every table and emits `drop table` for the
 * core schema (see reparatur's migrations / docs/RDS_RESTORE_LOCAL.md).
 */
export class Migration20260721120000 extends Migration {

  override async up(): Promise<void> {
    // ── customer_campaign ─────────────────────────────────────────────────
    this.addSql(`
      create table if not exists "customer_campaign" (
        "id" text not null,
        "customer_id" text not null,
        "source" text not null,
        "campaign_id" text not null,
        "sent_at" timestamptz null,
        "opened_at" timestamptz null,
        "clicked_at" timestamptz null,
        "bounced_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "customer_campaign_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_customer_campaign_deleted_at" on "customer_campaign" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_customer_campaign_customer_id" on "customer_campaign" ("customer_id");`);
    // One row per customer per campaign per source.
    this.addSql(`create unique index if not exists "UQ_customer_campaign_source_campaign_customer" on "customer_campaign" ("source", "campaign_id", "customer_id") where "deleted_at" is null;`);

    // ── marketing_profile ─────────────────────────────────────────────────
    this.addSql(`
      create table if not exists "marketing_profile" (
        "id" text not null,
        "customer_id" text not null,
        "unsubscribed" boolean not null default false,
        "unsubscribed_at" timestamptz null,
        "priority" text not null default 'none',
        "priority_rank" integer not null default 7,
        "last_opened_at" timestamptz null,
        "last_clicked_at" timestamptz null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "marketing_profile_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_marketing_profile_deleted_at" on "marketing_profile" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_marketing_profile_priority_rank" on "marketing_profile" ("priority_rank");`);
    // 1:1 with customer.
    this.addSql(`create unique index if not exists "UQ_marketing_profile_customer_id" on "marketing_profile" ("customer_id") where "deleted_at" is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_campaign" cascade;`);
    this.addSql(`drop table if exists "marketing_profile" cascade;`);
  }

}
