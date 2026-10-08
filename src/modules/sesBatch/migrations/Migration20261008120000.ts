import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Makes `ses_batch.source_type` / `source_id` NULLABLE so a batch can be built as
 * a campaign-agnostic audience segment first (recipients only) and have a campaign
 * assigned later. The original create-table migration (Migration20261002130000)
 * shipped these columns NOT NULL; `create table if not exists` can't alter an
 * existing table, so this ALTER is required on DBs that already have `ses_batch`.
 * Mirrors the sesEmails fix (Migration20261007120000). Hand-written ALTER, scoped
 * to this one table — never `db:generate` (it drops the shared DB's core tables).
 */
export class Migration20261008120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ses_batch" alter column "source_type" drop not null;`);
    this.addSql(`alter table if exists "ses_batch" alter column "source_id" drop not null;`);
  }

  override async down(): Promise<void> {
    // Re-asserting NOT NULL would fail if unassigned batches exist; left as a no-op.
  }

}
