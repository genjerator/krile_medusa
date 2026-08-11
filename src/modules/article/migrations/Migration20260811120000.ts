import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Creates `article_author` and `article` for the Magazin/blog module. Localised
 * (de / en / it) like `content_block`; `article.author_id` → `article_author`
 * (nullable). Hand-written with IF NOT EXISTS guards — never run
 * `medusa db:generate article` on this shared DB (it drops core tables — see
 * contentBlock / weeklyAction migrations).
 */
export class Migration20260811120000 extends Migration {

  override async up(): Promise<void> {
    // ── article_author ───────────────────────────────────────────────────
    this.addSql(`
      create table if not exists "article_author" (
        "id" text not null,
        "name" text not null,
        "slug" text not null,
        "role" text null,
        "photo_url" text null,
        "linkedin_url" text null,
        "website_url" text null,
        "xing_url" text null,
        "bio" text null, "bio_en" text null, "bio_it" text null,
        "active" boolean not null default true,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "article_author_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_article_author_deleted_at" on "article_author" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create unique index if not exists "UQ_article_author_slug" on "article_author" ("slug") where "deleted_at" is null;`);

    // ── article ──────────────────────────────────────────────────────────
    this.addSql(`
      create table if not exists "article" (
        "id" text not null,
        "slug" text not null,
        "status" text check ("status" in ('draft','published')) not null default 'draft',
        "published_at" timestamptz null,
        "cover_image" text null,
        "category" text null,
        "title" text not null,
        "title_en" text null, "title_it" text null,
        "excerpt" text null, "excerpt_en" text null, "excerpt_it" text null,
        "body" text null, "body_en" text null, "body_it" text null,
        "meta_title" text null, "meta_title_en" text null, "meta_title_it" text null,
        "meta_description" text null, "meta_description_en" text null, "meta_description_it" text null,
        "author_id" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "article_pkey" primary key ("id")
      );
    `);
    this.addSql(`create index if not exists "IDX_article_deleted_at" on "article" ("deleted_at") where "deleted_at" is null;`);
    this.addSql(`create unique index if not exists "UQ_article_slug" on "article" ("slug") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_article_status_published_at" on "article" ("status","published_at") where "deleted_at" is null;`);
    this.addSql(`create index if not exists "IDX_article_author_id" on "article" ("author_id") where "deleted_at" is null;`);
    // Guard the FK so re-running against an existing schema (e.g. a DB restored
    // from a dump where the constraint is already present) is idempotent.
    this.addSql(`alter table if exists "article" drop constraint if exists "article_author_id_foreign";`);
    this.addSql(`alter table if exists "article" add constraint "article_author_id_foreign" foreign key ("author_id") references "article_author" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "article" drop constraint if exists "article_author_id_foreign";`);
    this.addSql(`drop table if exists "article" cascade;`);
    this.addSql(`drop table if exists "article_author" cascade;`);
  }

}
