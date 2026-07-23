import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates `storefront_branding` — per-sales-channel storefront branding.
 * Hand-written with IF NOT EXISTS guards. Never run `medusa db:generate
 * storefrontBranding` on this shared DB (it drops core tables — see reparatur's
 * migrations / docs/RDS_RESTORE_LOCAL.md).
 */
export class Migration20260722130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "storefront_branding" (
        "id" text not null,
        "sales_channel_id" text not null,
        "hero_image_url" text null,
        "hero_title" text null,
        "hero_subtitle" text null,
        "primary_color" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "storefront_branding_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_storefront_branding_deleted_at" on "storefront_branding" ("deleted_at") where "deleted_at" is null;`);
    // One branding row per sales channel.
    this.addSql(`create unique index if not exists "UQ_storefront_branding_sales_channel" on "storefront_branding" ("sales_channel_id") where "deleted_at" is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "storefront_branding" cascade;`);
  }

}
