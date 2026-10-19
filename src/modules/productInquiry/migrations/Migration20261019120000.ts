import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds the branded-bag configurator fields to product_inquiry: the customer's
 * uploaded logo (S3 url), its original filename, a flattened preview image, and
 * the placement + bag options as JSON. All nullable — ordinary inquiries leave
 * them empty. Hand-written (never db:generate on this shared DB).
 */
export class Migration20261019120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "logo_url" text null;`);
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "logo_name" text null;`);
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "preview_url" text null;`);
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "details" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "logo_url";`);
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "logo_name";`);
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "preview_url";`);
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "details";`);
  }

}
