import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates `ses_batch` — the parent send-run for `ses_emails` (scheduling + status
 * + counters). Hand-written, IF NOT EXISTS. Never `db:generate sesBatch`.
 */
export class Migration20261002130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "ses_batch" (
        "id" text not null,
        "source_type" text null,
        "source_id" text null,
        "audience" text not null default 'test',
        "scheduled_at" timestamptz null,
        "status" text not null default 'draft',
        "total" integer not null default 0,
        "sent" integer not null default 0,
        "failed" integer not null default 0,
        "skipped" integer not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ses_batch_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_ses_batch_deleted_at" on "ses_batch" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_ses_batch_status" on "ses_batch" ("status");`);
    this.addSql(`create index if not exists "IDX_ses_batch_scheduled_at" on "ses_batch" ("scheduled_at");`);
    this.addSql(`create index if not exists "IDX_ses_batch_source" on "ses_batch" ("source_type", "source_id", "audience");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ses_batch" cascade;`);
  }

}
