import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds the display-order column (`rank`) to weekly_action_item so the merchant's
 * drag-to-reorder in the admin drawer persists (drives the admin list, the
 * storefront product order, and the generated email).
 *
 * HAND-WRITTEN ON PURPOSE — do not replace this with `medusa db:generate`.
 * That command introspects the whole shared database but only knows the two
 * weeklyAction entities, so it emits `drop table` for every other (core) table
 * and would wipe the schema. Only ever change weeklyAction columns by hand,
 * scoped to weekly_action / weekly_action_item, using `if (not) exists` guards.
 */
export class Migration20260708071500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "weekly_action_item" add column if not exists "rank" integer not null default 0;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "weekly_action_item" drop column if exists "rank";`
    );
  }
}
