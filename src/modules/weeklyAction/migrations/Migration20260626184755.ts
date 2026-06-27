import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260626184755 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "weekly_action" ("id" text not null, "title" text not null, "year" integer not null, "iso_week" integer not null, "starts_at" timestamptz not null, "ends_at" timestamptz not null, "status" text check ("status" in ('draft', 'planned')) not null default 'draft', "default_discount_type" text check ("default_discount_type" in ('percentage', 'fixed')) not null default 'percentage', "default_discount_value" real null, "price_list_id" text null, "brevo_campaign_id" text null, "brevo_template_id" text null, "brevo_synced_at" timestamptz null, "brevo_status" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "weekly_action_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_weekly_action_deleted_at" ON "weekly_action" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "weekly_action_item" ("id" text not null, "product_id" text not null, "discount_type" text check ("discount_type" in ('percentage', 'fixed')) not null, "discount_value" real not null, "weekly_action_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "weekly_action_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_weekly_action_item_weekly_action_id" ON "weekly_action_item" ("weekly_action_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_weekly_action_item_deleted_at" ON "weekly_action_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "weekly_action_item" add constraint "weekly_action_item_weekly_action_id_foreign" foreign key ("weekly_action_id") references "weekly_action" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "weekly_action_item" drop constraint if exists "weekly_action_item_weekly_action_id_foreign";`);

    this.addSql(`drop table if exists "weekly_action" cascade;`);

    this.addSql(`drop table if exists "weekly_action_item" cascade;`);
  }

}
