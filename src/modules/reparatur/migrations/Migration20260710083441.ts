import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260710083441 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "reparatur" ("id" text not null, "kd_nr" text null, "name" text not null, "vorname" text not null, "kontakt" text null, "strasse_nr" text not null, "plz" text not null, "ort" text not null, "land" text not null, "tel" text null, "email" text not null, "kunden_nummer" text null, "geraete_nummer" text null, "anderer_empfaenger" boolean not null default false, "datum" text null, "beschreibung" text not null, "unterschrift_ort" text null, "unterschrift_datum" text null, "unterschrift" text null, "sales_channel_id" text null, "source_url" text null, "locale" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reparatur_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reparatur_deleted_at" ON "reparatur" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reparatur" cascade;`);
  }

}
