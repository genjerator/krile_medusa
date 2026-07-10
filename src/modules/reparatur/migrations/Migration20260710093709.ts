import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds `pdf_url` to the reparatur table.
 *
 * Hand-written and scoped to the reparatur table ONLY. The original
 * auto-generated version of this file (from `medusa db:generate reparatur`)
 * introspected the whole shared DB and emitted `drop table` for every core
 * table — it wiped the schema. Never regenerate migrations for a single module
 * against the shared DB; add columns by hand with IF (NOT) EXISTS guards.
 * See docs/RDS_RESTORE_LOCAL.md.
 */
export class Migration20260710093709 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "reparatur" add column if not exists "pdf_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "reparatur" drop column if exists "pdf_url";`);
  }

}
