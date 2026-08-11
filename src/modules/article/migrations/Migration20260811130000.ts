import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds `article.sales_channel_id` — scopes an article to a sales channel
 * (Industries vs Planeta GmbH). NULL = shown in all channels. Hand-written with
 * IF NOT EXISTS — never run `medusa db:generate article` on this shared DB.
 */
export class Migration20260811130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "article" add column if not exists "sales_channel_id" text null;`);
    this.addSql(`create index if not exists "IDX_article_sales_channel_id" on "article" ("sales_channel_id") where "deleted_at" is null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "article" drop column if exists "sales_channel_id";`);
  }

}
