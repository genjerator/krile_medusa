import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260607160500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" add column if not exists "sales_channel_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_inquiry" drop column if exists "sales_channel_id";`);
  }

}
