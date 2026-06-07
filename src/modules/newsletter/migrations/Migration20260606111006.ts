import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260606111006 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "newsletter_preference" drop constraint if exists "newsletter_preference_customer_id_unique";`);
    this.addSql(`create table if not exists "newsletter_preference" ("id" text not null, "customer_id" text not null, "subscribed" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "newsletter_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_newsletter_preference_customer_id_unique" ON "newsletter_preference" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_newsletter_preference_deleted_at" ON "newsletter_preference" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "newsletter_preference" cascade;`);
  }

}
