import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Makes `ses_emails.source_type` / `source_id` NULLABLE so an outbox row can be
 * generated as a bare audience member (part of a campaign-agnostic batch) before
 * a campaign is assigned. Hand-written ALTER, scoped to this one table — never
 * `db:generate` (it drops the shared DB's core tables).
 */
export class Migration20261007120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ses_emails" alter column "source_type" drop not null;`);
    this.addSql(`alter table if exists "ses_emails" alter column "source_id" drop not null;`);
  }

  override async down(): Promise<void> {
    // Re-asserting NOT NULL would fail if unassigned rows exist; left as a no-op.
  }

}
