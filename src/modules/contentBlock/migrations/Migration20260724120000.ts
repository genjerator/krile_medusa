import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates `content_block` — reusable static rich-text content addressed by a
 * unique `key`, localised (de / en / it). Hand-written with IF NOT EXISTS
 * guards. Never run `medusa db:generate contentBlock` on this shared DB (it
 * drops core tables — see storefrontBranding / reparatur migrations).
 */
export class Migration20260724120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "content_block" (
        "id" text not null,
        "key" text not null,
        "title" text null,
        "body" text null,
        "body_en" text null,
        "body_it" text null,
        "status" text not null default 'published',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "content_block_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_content_block_deleted_at" on "content_block" ("deleted_at") where "deleted_at" is null;`);
    // One block per key.
    this.addSql(`create unique index if not exists "UQ_content_block_key" on "content_block" ("key") where "deleted_at" is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "content_block" cascade;`);
  }

}
