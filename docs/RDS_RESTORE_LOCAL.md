# Restore the RDS database into local Postgres

How to pull a fresh copy of the production database (AWS RDS, `krile_medusa`) into
your **local** dev Postgres (`medusa-v2`, the `krile_medusa-postgres-1` Docker
container). The whole process is **read-only on RDS** — nothing is ever written
back to production.

> ⚠️ **Before anything else — never run `npx medusa db:generate weeklyAction`
> (or any `db:generate <module>`) against this database.** It introspects the
> *entire* shared DB but only knows that one module's entities, so it emits
> `drop table` for every other (core) table. That is exactly what wiped the
> schema and forced this restore (`Migration20260626225225`). **Add columns to
> custom modules by hand**, scoped to the module's tables, with `if (not) exists`
> guards. See `src/modules/weeklyAction/migrations/Migration20260627120000.ts`.

---

## TL;DR

1. Dump RDS with a **PG18** client (RDS is Postgres 18).
2. Recreate the local Postgres container fresh as **PG18** (matching major version).
3. `pg_restore` into local `medusa-v2`.
4. `npx medusa db:migrate` to apply local-only migrations (e.g. `is_active`).
5. Boot with `npx medusa develop`.
6. Fix the **storefront publishable key** (it changes — see last section).

---

## 0. Connection string

Copy the RDS URL from `.env.awsec2` (or `.env.strato`). Strip `uselibpqcompat`
(a node-pg flag `pg_dump`/`psql` don't understand) — keep only `sslmode=require`:

```
export RDS_URL="postgres://krilepostgres:PASSWORD@krile-medusa.c9akcukmi9sx.eu-central-1.rds.amazonaws.com:5432/krile_medusa?sslmode=require"
```

`PGOPTIONS="-c default_transaction_read_only=on"` is added to every RDS command
below so the **server rejects any write** — belt-and-suspenders on top of the
fact that `pg_dump`/`psql -c "select"` only read.

---

## 1. Create the dump (read-only on RDS)

Test connectivity and confirm the server version:

```
docker run --rm -e PGOPTIONS="-c default_transaction_read_only=on" postgres:18 psql "$RDS_URL" -c "select version();"
```

Create the dump (custom/compressed format `-Fc`). Use a throwaway `postgres:18`
container so the `pg_dump` client version matches the RDS server:

```
docker run --rm -e PGOPTIONS="-c default_transaction_read_only=on" postgres:18 pg_dump "$RDS_URL" -Fc > ~/krile_rds_$(date +%Y%m%d_%H%M).dump
```

Verify the file and peek inside (lists the table-of-contents):

```
ls -lh ~/krile_rds_*.dump
```
```
cat ~/krile_rds_*.dump | docker run --rm -i postgres:18 pg_restore -l | grep -E "TABLE DATA .*(product|price_list|payment_provider|weekly_action)" | head
```

---

## 2. Recreate the local Postgres fresh as PG18

The local data is disposable (we're replacing it). `docker-compose.yml` already
pins `postgres:18` with the mount at `/var/lib/postgresql` (PG18's required
layout — see Problems below).

```
docker compose stop medusa postgres
```
```
docker compose rm -f postgres
```
```
docker volume rm krile_medusa_postgres_data
```
```
docker compose up -d postgres
```
```
docker exec krile_medusa-postgres-1 pg_isready -U postgres
```

The fresh container auto-creates an empty `medusa-v2` DB via `POSTGRES_DB`.

---

## 3. Restore into local `medusa-v2`

`--no-owner --no-privileges` maps everything to the local `postgres` user and
skips the RDS `krilepostgres` grants:

```
DUMP=$(ls -t ~/krile_rds_*.dump | head -1); echo "restoring $DUMP"
```
```
docker exec -i krile_medusa-postgres-1 pg_restore -U postgres -d medusa-v2 --no-owner --no-privileges < "$DUMP"
```

A few warnings (comments/extensions) are normal. Verify:

```
docker exec krile_medusa-postgres-1 psql -U postgres -d medusa-v2 -tAc "select count(*) from information_schema.tables where table_schema='public';"
```
```
docker exec krile_medusa-postgres-1 psql -U postgres -d medusa-v2 -tAc "select count(*) from product;"
```

(Expect ~146 tables and the real product count — not 26.)

---

## 4. Apply local-only migrations

RDS does **not** have the `weeklyAction` module tables (it was never deployed
there), and it doesn't have the `is_active` column. From the repo root (uses
`.env` → `localhost:5432/medusa-v2`):

```
npx medusa db:migrate
```

This creates `weekly_action` / `weekly_action_item` and adds `is_active`. Verify:

```
docker exec krile_medusa-postgres-1 psql -U postgres -d medusa-v2 -tAc "select column_name from information_schema.columns where table_name='weekly_action' and column_name='is_active';"
```

---

## 5. Boot the backend

For **local dev** use `develop` (loads TS source directly, watches files,
regenerates types, serves the admin in dev mode):

```
npx medusa develop
```

Check: `http://localhost:9000/health` → 200, and `http://localhost:9000/app`.

> Don't run the host `medusa develop`/`start` AND the Docker `medusa` container
> at the same time — they both bind port 9000. Keep the container stopped
> (`docker compose stop medusa`) while developing on the host.

---

## 6. Fix the storefront publishable key (IMPORTANT)

After a restore, the storefront's old `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` no
longer exists (it was a key from the *previous* local DB). The storefront then
returns **Internal Server Error / "A valid publishable key is required"**.

List the keys that now exist in the restored DB:

```
docker exec krile_medusa-postgres-1 psql -U postgres -d medusa-v2 -tAc "select token, title from api_key where type='publishable';"
```

Pick the one for the brand and update the storefront's `.env.local`:

- **planetagmbh_medusa-storefront** → key titled `PlanetaGmbhDe`
- (krile / industries storefront → `PlanetaIndustriesAPIkey`)

```
# planetagmbh_medusa-storefront/.env.local
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...<PlanetaGmbhDe token>...
```

**Restart the storefront** so Next.js picks up the new env (it won't reload
`NEXT_PUBLIC_*` on a running server):

```
pkill -f "planetagmbh_medusa-storefront.*next"; cd /Users/genjerator/Projects/planetagmbh_medusa-storefront && npm run dev
```

---

## Potential problems & fixes (everything we actually hit)

| Symptom | Cause | Fix |
|---|---|---|
| `pg_dump: error: aborting because of server version mismatch` (server 18.x, client 17.x) | `pg_dump` must be **≥** the server version; the local `postgres:17` client can't dump PG18 | Run dump via a throwaway `postgres:18` container (Step 1) |
| `psql: ... FATAL: role "root" does not exist` | Shell-expansion bug: `"$PGURL"` was expanded on the **host** (unset) so psql got no conn string and used the local socket | Pass `"$RDS_URL"` **directly** as the arg (host has it set); only use `-e` for `PGOPTIONS` |
| Restore fails / weird errors restoring into PG17 | Restoring a **newer** dump (PG18) into an **older** server (PG17) is unsupported | Make local Postgres the **same major version** as RDS (PG18) |
| PG18 container exits on boot: *"There appears to be PostgreSQL data in /var/lib/postgresql/data (unused mount/volume)"* | PG18 image changed the data layout — it wants the mount at **`/var/lib/postgresql`**, not `/var/lib/postgresql/data` | `docker-compose.yml` mounts `postgres_data:/var/lib/postgresql`; use a **fresh** volume |
| `docker volume rm` "didn't work" / old data still present | The exited container still **references** the volume | `docker compose rm -f postgres` first, then `docker volume rm krile_medusa_postgres_data` |
| Restore role/permission errors mentioning `krilepostgres` | Dump objects are owned by the RDS user, which doesn't exist locally | `pg_restore --no-owner --no-privileges` |
| Backend boot: `ValidationError ... ERR_ERL_KEY_GEN_IPV6` at `src/api/middlewares.ts` | `express-rate-limit` v8 rejects a custom `keyGenerator` that uses `req.ip` directly | Remove the custom `keyGenerator` (the default is IPv6-safe) |
| `medusa start`: *"Could not find index.html in the admin build directory"* even though it exists | `start` (production) is finicky about cwd/admin path | Use `npx medusa develop` for local; for prod, run `medusa start` from `.medusa/server` after `medusa build` |
| Storefront: **Internal Server Error** / "A valid publishable key is required" | The restore replaced the DB, so the old publishable key is gone | Update `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to a key from the restored DB and **restart** the storefront (Step 6) |
| Post-`db:migrate` "relation ... does not exist" provider-sync errors | Harmless post-migration loader chatter | Ignore — the boot in Step 5 is the real test |

---

## Read-only guarantees on RDS (why this is safe)

- `pg_dump` only issues `SELECT`s + `ACCESS SHARE` locks and runs its own
  transaction as `READ ONLY`. It has no write path.
- Every RDS command above also sets `PGOPTIONS="-c default_transaction_read_only=on"`,
  so the **server** rejects any write in that session.
- `pg_restore` (the only writing command) is **only ever** pointed at local
  `medusa-v2`, never at RDS. No `--clean`/DDL is ever run against RDS.
- Best practice: run the dump during low-traffic periods.
