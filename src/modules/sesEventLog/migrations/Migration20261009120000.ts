import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Adds per-LINK click tracking to `ses_event_log`: a `link` column holding the URL
 * from a SES Click event (`event.click.link`), so we can report WHICH link in an
 * email was clicked — not just that a click happened.
 *
 * Hand-written, additive, idempotent (IF NOT EXISTS). Do NOT regenerate via
 * `medusa db:generate sesEventLog` — on this shared database the generator emits
 * `drop table` for the core schema.
 *
 * The UPDATE backfills `link` for Click rows already in the log from their stored
 * raw payload, so historical clicks appear in the report too. Idempotent: it only
 * touches Click rows whose `link` is still null.
 */
export class Migration20261009120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "ses_event_log" add column if not exists "link" text null;`);
    this.addSql(`create index if not exists "IDX_ses_event_log_campaign_id" on "ses_event_log" ("campaign_id");`);
    this.addSql(`create index if not exists "IDX_ses_event_log_link" on "ses_event_log" ("link");`);
    // Backfill historical Click rows from the raw payload (idempotent).
    this.addSql(`
      update "ses_event_log"
         set "link" = "payload"->'click'->>'link'
       where "event" = 'Click'
         and "link" is null
         and "payload"->'click'->>'link' is not null;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_ses_event_log_link";`);
    this.addSql(`drop index if exists "IDX_ses_event_log_campaign_id";`);
    this.addSql(`alter table if exists "ses_event_log" drop column if exists "link";`);
  }

}
