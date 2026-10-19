import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Hand-written (never `medusa db:generate` — that drops the shared core tables).
 *
 * Creates:
 *  - `social_auth_account` — this module's own link/audit model (snake_case,
 *     Medusa conventions).
 *  - `ba_user` / `ba_session` / `ba_account` / `ba_verification` — Better Auth's
 *     core tables. Column names are the exact camelCase identifiers Better Auth
 *     queries (quoted so Postgres keeps the case), and types follow Better Auth's
 *     Postgres mapping (string→text, date→timestamptz, boolean→boolean, id→text).
 *     Tables are `ba_`-prefixed via `modelName` overrides in
 *     `src/lib/better-auth/auth.ts` so they never collide with Medusa's own
 *     core `user` table. Better Auth's own `migrate` CLI is never run against
 *     this database — this file is the single source of that schema.
 */
export class Migration20261014120000 extends Migration {

  override async up(): Promise<void> {
    // --- Medusa-side link / audit model ---
    this.addSql(`create table if not exists "social_auth_account" ("id" text not null, "provider" text not null, "ba_user_id" text not null, "email" text null, "email_verified" boolean not null default false, "customer_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "social_auth_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_social_auth_account_ba_user_id" ON "social_auth_account" ("ba_user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_social_auth_account_customer_id" ON "social_auth_account" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_social_auth_account_deleted_at" ON "social_auth_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    // --- Better Auth core tables ---
    this.addSql(`create table if not exists "ba_user" ("id" text not null, "name" text not null, "email" text not null, "emailVerified" boolean not null default false, "image" text null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), constraint "ba_user_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ba_user_email" ON "ba_user" ("email");`);

    this.addSql(`create table if not exists "ba_session" ("id" text not null, "expiresAt" timestamptz not null, "token" text not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), "ipAddress" text null, "userAgent" text null, "userId" text not null, constraint "ba_session_pkey" primary key ("id"), constraint "ba_session_userId_fkey" foreign key ("userId") references "ba_user" ("id") on update cascade on delete cascade);`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ba_session_token" ON "ba_session" ("token");`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ba_session_userId" ON "ba_session" ("userId");`);

    this.addSql(`create table if not exists "ba_account" ("id" text not null, "accountId" text not null, "providerId" text not null, "userId" text not null, "accessToken" text null, "refreshToken" text null, "idToken" text null, "accessTokenExpiresAt" timestamptz null, "refreshTokenExpiresAt" timestamptz null, "scope" text null, "password" text null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), constraint "ba_account_pkey" primary key ("id"), constraint "ba_account_userId_fkey" foreign key ("userId") references "ba_user" ("id") on update cascade on delete cascade);`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ba_account_userId" ON "ba_account" ("userId");`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ba_account_provider" ON "ba_account" ("providerId", "accountId");`);

    this.addSql(`create table if not exists "ba_verification" ("id" text not null, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(), constraint "ba_verification_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ba_verification_identifier" ON "ba_verification" ("identifier");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "ba_session" cascade;`);
    this.addSql(`drop table if exists "ba_account" cascade;`);
    this.addSql(`drop table if exists "ba_verification" cascade;`);
    this.addSql(`drop table if exists "ba_user" cascade;`);
    this.addSql(`drop table if exists "social_auth_account" cascade;`);
  }

}
