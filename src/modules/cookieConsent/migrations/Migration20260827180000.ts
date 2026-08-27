import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Hand-written (never `medusa db:generate` — that drops the shared core tables).
 * Daily cookie-consent tallies, flushed from Redis. Unique per (brand, date).
 */
export class Migration20260827180000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "cookie_consent_daily" ("id" text not null, "brand" text not null, "date" text not null, "shown" real not null default 0, "accepted" real not null default 0, "declined" real not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cookie_consent_daily_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cookie_consent_daily_brand_date" ON "cookie_consent_daily" ("brand", "date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cookie_consent_daily_deleted_at" ON "cookie_consent_daily" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cookie_consent_daily" cascade;`);
  }

}
