import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds `weekly_action.email_subject` — the customer-facing subject line used when
 * the campaign is sent as an email (falls back to `title` when empty). Hand-written
 * ALTER, IF NOT EXISTS, scoped to this one column — never `db:generate` (it drops
 * the shared DB's core tables).
 */
export class Migration20261008130000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "weekly_action" add column if not exists "email_subject" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "weekly_action" drop column if exists "email_subject";`);
  }

}
