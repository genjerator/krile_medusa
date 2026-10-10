import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds `ses_batch.campaign_id` — the owning marketing campaign for a group-send
 * batch (NULL for prototype / ad-hoc batches). Lets a campaign fetch all of its
 * per-group batches (and their stats) by a single indexed column.
 *
 * Hand-written, idempotent (ADD COLUMN IF NOT EXISTS). Never `db:generate`.
 */
export class Migration20261010121000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ses_batch" add column if not exists "campaign_id" text null;`);
    this.addSql(`create index if not exists "IDX_ses_batch_campaign_id" on "ses_batch" ("campaign_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_ses_batch_campaign_id";`);
    this.addSql(`alter table if exists "ses_batch" drop column if exists "campaign_id";`);
  }

}
