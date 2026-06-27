import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds the manual on/off switch (`is_active`) to weekly_action.
 *
 * HAND-WRITTEN ON PURPOSE — do not replace this with `medusa db:generate`.
 * That command introspects the whole shared database but only knows the two
 * weeklyAction entities, so it emits `drop table` for every other (core) table.
 * A previous auto-generated migration (Migration20260626225225) did exactly
 * that and wiped the schema. Only ever change weeklyAction columns by hand,
 * scoped to weekly_action / weekly_action_item, using `if (not) exists` guards.
 */
export class Migration20260627120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "weekly_action" add column if not exists "is_active" boolean not null default false;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "weekly_action" drop column if exists "is_active";`
    );
  }
}
