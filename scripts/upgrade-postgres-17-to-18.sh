#!/usr/bin/env bash
# Safe major upgrade of the dockerized Strato Postgres 17 -> 18 via dump/restore.
#
#   ./scripts/upgrade-postgres-17-to-18.sh
#
# Run from the app dir on the VPS (where docker-compose.strato.yml lives).
#
# What it does, in order (so there's no chance of starting 18 on the old data):
#   1. Stops medusa (freezes DB writes).
#   2. Dumps the live 17 database (pg_dump -Fc) to ~/db-backups.
#   3. Stops postgres 17 — its volume (postgres_data) is LEFT UNTOUCHED.
#   4. Rewrites docker-compose.strato.yml to the PG18 image ($PG18_IMAGE, the
#      pgvector build by default) on a NEW, empty volume (postgres_data_18)
#      mounted the 18 way (/var/lib/postgresql).
#      The original file is backed up to docker-compose.strato.yml.bak.pre18.
#   5. Brings up 18 (it inits the role/db from .env.strato), restores the dump.
#   6. Verifies (server version + table count), then starts the rest of the stack.
#
# ROLLBACK (data never left the 17 volume):
#   cp docker-compose.strato.yml.bak.pre18 docker-compose.strato.yml
#   docker compose -f docker-compose.strato.yml up -d postgres && \
#   docker compose -f docker-compose.strato.yml up -d
#
# NOTE: there is a short DOWNTIME window (medusa is down during dump+restore).
# Run it at low traffic.
set -euo pipefail

COMPOSE="${COMPOSE_FILE:-docker-compose.strato.yml}"
ENV_FILE="${ENV_FILE:-.env.strato}"
DC=(docker compose -f "$COMPOSE")

[ -f "$COMPOSE" ] || { echo "ERROR: $COMPOSE not found (run from the app dir)"; exit 1; }

env_val() { [ -f "$ENV_FILE" ] || return 0; grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr -d '"'; }
PGUSER="${POSTGRES_USER:-$(env_val POSTGRES_USER)}"; PGUSER="${PGUSER:-medusa}"
PGDB="${POSTGRES_DB:-$(env_val POSTGRES_DB)}"; PGDB="${PGDB:-medusa}"

BACKUP_DIR="${BACKUP_DIR:-$HOME/db-backups}"
DUMP="$BACKUP_DIR/pre18_$(date +%Y%m%d_%H%M%S).dump"

# The PG18 target image. Default = the custom pgvector build (same as local dev),
# so the VPS matches local and is ready for vector columns. Built from
# Dockerfile.pgvector if not already present on the host.
PG18_IMAGE="${PG18_IMAGE:-krile-medusa-postgres:pg18-pgvector}"

echo "==> Postgres 17 -> 18 upgrade   (db=$PGDB user=$PGUSER, target image=$PG18_IMAGE)"

# 0. sanity — must currently be running 17, not already 18
img="$("${DC[@]}" ps postgres --format '{{.Image}}' 2>/dev/null || true)"
echo "    current postgres image: ${img:-<none>}"
case "$img" in
  *postgres:18*) echo "Already on 18 — nothing to do."; exit 0 ;;
  *postgres:17*) : ;;
  *) echo "ERROR: postgres not running as 17 (image='$img'). Aborting."; exit 1 ;;
esac

# 0b. make sure the PG18 target image exists on this host (build it if not).
#     Done BEFORE any downtime, so a missing/broken image aborts with nothing changed.
if ! docker image inspect "$PG18_IMAGE" >/dev/null 2>&1; then
  if [ -f Dockerfile.pgvector ]; then
    echo "==> $PG18_IMAGE not present — building it from Dockerfile.pgvector"
    docker build -f Dockerfile.pgvector -t "$PG18_IMAGE" .
  else
    echo "ERROR: image '$PG18_IMAGE' not found and Dockerfile.pgvector is missing."
    echo "       Build it (docker build -f Dockerfile.pgvector -t $PG18_IMAGE .)"
    echo "       or push/pull it from a registry, then re-run."
    exit 1
  fi
fi

# 1. freeze writes
echo "==> stopping medusa (freeze writes)"
"${DC[@]}" stop medusa

# 2. dump the live 17 database
echo "==> dumping 17 database -> $DUMP"
mkdir -p "$BACKUP_DIR"
"${DC[@]}" exec -T postgres pg_dump -U "$PGUSER" -d "$PGDB" -Fc > "$DUMP"
if [ ! -s "$DUMP" ]; then
  echo "ERROR: dump is empty — restarting medusa and aborting (nothing changed)."
  "${DC[@]}" start medusa
  exit 1
fi
echo "    dump ok: $(ls -lh "$DUMP" | awk '{print $5}')"

# 3. stop 17 (its volume postgres_data stays intact for rollback)
echo "==> stopping postgres 17 (volume kept)"
"${DC[@]}" stop postgres

# 4. rewrite compose -> 18 on a fresh volume (backup first)
echo "==> switching $COMPOSE to postgres 18 + new volume postgres_data_18"
cp "$COMPOSE" "$COMPOSE.bak.pre18"
sed -i "s#image: postgres:17-alpine#image: $PG18_IMAGE#" "$COMPOSE"
sed -i 's|- postgres_data:/var/lib/postgresql/data|- postgres_data_18:/var/lib/postgresql|' "$COMPOSE"
grep -q '^  postgres_data_18:' "$COMPOSE" || sed -i '/^  postgres_data:$/a\  postgres_data_18:' "$COMPOSE"
echo "    compose now:"; grep -nE 'image:.*postgres|postgres_data(_18)?:/var/lib|^  postgres_data' "$COMPOSE" | sed 's/^/      /'

# 5. bring up fresh 18 (inits role/db from .env.strato) and wait for ready
echo "==> starting postgres 18 (fresh empty volume)"
"${DC[@]}" up -d postgres
echo "==> waiting for 18 to accept connections"
ready=""
for i in $(seq 1 60); do
  if "${DC[@]}" exec -T postgres pg_isready -U "$PGUSER" >/dev/null 2>&1; then ready=1; echo "    ready"; break; fi
  sleep 2
done
[ -n "$ready" ] || { echo "ERROR: postgres 18 did not become ready. See rollback in the header."; exit 1; }

# 6. restore
echo "==> restoring dump into 18"
cat "$DUMP" | "${DC[@]}" exec -T postgres pg_restore -U "$PGUSER" -d "$PGDB" --no-owner --no-acl \
  || echo "    (pg_restore printed non-fatal warnings — verifying below)"

# 7. verify
ver="$("${DC[@]}" exec -T postgres psql -U "$PGUSER" -d "$PGDB" -tAc 'show server_version;' | tr -d '[:space:]')"
tables="$("${DC[@]}" exec -T postgres psql -U "$PGUSER" -d "$PGDB" -tAc "select count(*) from information_schema.tables where table_schema='public';" | tr -d '[:space:]')"
echo "==> restored: server_version=$ver  public_tables=${tables:-0}"
if [ "${tables:-0}" -lt 1 ]; then
  echo "ERROR: no tables restored. ROLL BACK (see header). Your 17 data is safe in volume postgres_data."
  exit 1
fi

# 8. start the rest of the stack
echo "==> starting the rest of the stack"
"${DC[@]}" up -d

cat <<EOF

DONE ✅  Postgres $ver with $tables tables. App restarted.
  · Dump kept:        $DUMP
  · Old 17 data:      intact in docker volume 'postgres_data' (rollback safety)
  · Compose backup:   $COMPOSE.bak.pre18

If anything looks wrong, ROLL BACK to 17:
  cp $COMPOSE.bak.pre18 $COMPOSE
  ${DC[*]} up -d postgres && ${DC[*]} up -d

Once you're happy on 18, commit so git matches the VPS:
  git add $COMPOSE && git commit -m "postgres 18 via dump/restore" && git push

Later cleanup (only after days of confidence): remove the old volume with
  docker volume rm <project>_postgres_data
EOF
