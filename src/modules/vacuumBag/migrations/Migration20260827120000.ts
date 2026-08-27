import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Hand-written (never `medusa db:generate` — that drops the shared core tables).
 * Creates the three vacuumBag tables: colours, the price matrix, and the
 * per-product config. Idempotent (`if not exists` / `if exists`).
 */
export class Migration20260827120000 extends Migration {

  override async up(): Promise<void> {
    // Colours
    this.addSql(`create table if not exists "vacuum_bag_color" ("id" text not null, "name" text not null, "slug" text not null, "hex" text null, "image_url" text null, "rank" integer not null default 0, "is_default" boolean not null default false, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vacuum_bag_color_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vacuum_bag_color_slug_unique" ON "vacuum_bag_color" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_color_deleted_at" ON "vacuum_bag_color" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Price matrix
    this.addSql(`create table if not exists "vacuum_bag_price" ("id" text not null, "thickness_um" integer not null, "width_mm" integer not null, "height_mm" integer not null, "price" real not null, "currency_code" text not null default 'eur', "active" boolean not null default true, "color_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vacuum_bag_price_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_combo_unique" ON "vacuum_bag_price" ("color_id", "thickness_um", "width_mm", "height_mm") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_color_id" ON "vacuum_bag_price" ("color_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_deleted_at" ON "vacuum_bag_price" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table if exists "vacuum_bag_price" add constraint "vacuum_bag_price_color_id_foreign" foreign key ("color_id") references "vacuum_bag_color" ("id") on update cascade;`);

    // Per-product config
    this.addSql(`create table if not exists "vacuum_bag_config" ("id" text not null, "pack_size" integer not null default 1000, "default_color_id" text null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vacuum_bag_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_config_deleted_at" ON "vacuum_bag_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vacuum_bag_price" drop constraint if exists "vacuum_bag_price_color_id_foreign";`);
    this.addSql(`drop table if exists "vacuum_bag_price" cascade;`);
    this.addSql(`drop table if exists "vacuum_bag_color" cascade;`);
    this.addSql(`drop table if exists "vacuum_bag_config" cascade;`);
  }

}
