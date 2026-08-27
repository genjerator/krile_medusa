import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Hand-written (never `medusa db:generate` — that drops the shared core tables).
 * Creates the three seoMetrics cache tables that mirror GA4/GSC/Bing pulls.
 */
export class Migration20260827160000 extends Migration {

  override async up(): Promise<void> {
    // Overview KPI time-series
    this.addSql(`create table if not exists "seo_metric_daily" ("id" text not null, "brand" text not null, "source" text check ("source" in ('ga4', 'gsc', 'bing')) not null, "date" text not null, "metric_type" text not null, "value" real not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seo_metric_daily_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_metric_daily_lookup" ON "seo_metric_daily" ("brand", "source", "date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_metric_daily_deleted_at" ON "seo_metric_daily" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Top queries (GSC + Bing)
    this.addSql(`create table if not exists "seo_query_daily" ("id" text not null, "brand" text not null, "source" text check ("source" in ('gsc', 'bing')) not null, "date" text not null, "query" text not null, "page" text null, "clicks" real not null default 0, "impressions" real not null default 0, "ctr" real not null default 0, "position" real null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seo_query_daily_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_query_daily_lookup" ON "seo_query_daily" ("brand", "source", "date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_query_daily_deleted_at" ON "seo_query_daily" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Top pages (GSC + Bing)
    this.addSql(`create table if not exists "seo_page_daily" ("id" text not null, "brand" text not null, "source" text check ("source" in ('gsc', 'bing')) not null, "date" text not null, "page" text not null, "clicks" real not null default 0, "impressions" real not null default 0, "ctr" real not null default 0, "position" real null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seo_page_daily_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_page_daily_lookup" ON "seo_page_daily" ("brand", "source", "date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seo_page_daily_deleted_at" ON "seo_page_daily" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "seo_metric_daily" cascade;`);
    this.addSql(`drop table if exists "seo_query_daily" cascade;`);
    this.addSql(`drop table if exists "seo_page_daily" cascade;`);
  }

}
