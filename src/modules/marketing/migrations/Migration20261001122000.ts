import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds `user_type` (free-text customer classification) to `marketing_profile`.
 * Used for campaign targeting/testing — e.g. "test", "bought_once",
 * "bought_multiple", "opened_brevo", "opened_ses".
 *
 * Hand-written, column-only, IF NOT EXISTS. Never `db:generate marketing` on the
 * shared DB — it drops the core schema (see the other marketing migrations).
 */
export class Migration20261001122000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "marketing_profile" add column if not exists "user_type" text null;`);
    this.addSql(`create index if not exists "IDX_marketing_profile_user_type" on "marketing_profile" ("user_type") where "user_type" is not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_marketing_profile_user_type";`);
    this.addSql(`alter table if exists "marketing_profile" drop column if exists "user_type";`);
  }

}
