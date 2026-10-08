import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Hand-written (never `medusa db:generate` — that drops the shared core tables).
 *
 * Adds the product-line dimension to the configurator:
 *  - new `vacuum_bag_type` table (one row per Niederwieser line; carries the
 *    fixed thickness + preview image),
 *  - `type_id` FK on the price matrix,
 *  - re-keys the matrix uniqueness from (colour, thickness, w, h) to
 *    (colour, type, w, h): thickness is now implied by the type, and several
 *    types share the same µm (e.g. 90), so thickness can no longer be part of
 *    the key.
 *
 * `type_id` is nullable at the DB level so the ALTER is safe on tables that still
 * hold old placeholder rows; the seed replaces those rows and always sets it.
 */
export class Migration20261008120000 extends Migration {

  override async up(): Promise<void> {
    // Product-line / "Ausführung" table
    this.addSql(`create table if not exists "vacuum_bag_type" ("id" text not null, "name" text not null, "slug" text not null, "thickness_um" integer not null, "description" text null, "image_url" text null, "rank" integer not null default 0, "is_default" boolean not null default false, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vacuum_bag_type_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vacuum_bag_type_slug_unique" ON "vacuum_bag_type" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_type_deleted_at" ON "vacuum_bag_type" ("deleted_at") WHERE deleted_at IS NULL;`);

    // Matrix gains the type dimension
    this.addSql(`alter table if exists "vacuum_bag_price" add column if not exists "type_id" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_type_id" ON "vacuum_bag_price" ("type_id") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table if exists "vacuum_bag_price" add constraint "vacuum_bag_price_type_id_foreign" foreign key ("type_id") references "vacuum_bag_type" ("id") on update cascade;`);

    // Re-key uniqueness: drop the old (colour, thickness, w, h) index, add the
    // new (colour, type, w, h) one.
    this.addSql(`drop index if exists "IDX_vacuum_bag_price_combo_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_combo_unique" ON "vacuum_bag_price" ("color_id", "type_id", "width_mm", "height_mm") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_vacuum_bag_price_combo_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vacuum_bag_price_combo_unique" ON "vacuum_bag_price" ("color_id", "thickness_um", "width_mm", "height_mm") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table if exists "vacuum_bag_price" drop constraint if exists "vacuum_bag_price_type_id_foreign";`);
    this.addSql(`drop index if exists "IDX_vacuum_bag_price_type_id";`);
    this.addSql(`alter table if exists "vacuum_bag_price" drop column if exists "type_id";`);
    this.addSql(`drop table if exists "vacuum_bag_type" cascade;`);
  }

}
