import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260606203408 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "phone" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "phone";`);
  }

}
