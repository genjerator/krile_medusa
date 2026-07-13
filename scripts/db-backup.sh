#!/usr/bin/env bash
# Daily Postgres snapshot from the dockerized DB (docker-compose.strato.yml).
# Dumps in pg_dump custom format (-Fc): compressed, restorable with pg_restore.
# Intended to run from cron on the VPS. Old dumps beyond RETENTION_DAYS are pruned.
set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
# Everything is configured in .env.strato (BACKUP_* keys). Only the location of
# that file is set here: the Strato VPS has the repo at ~/app (see docs/STRATO_SETUP.md).
APP_DIR="${APP_DIR:-$HOME/app}"
ENV_FILE="${ENV_FILE:-.env.strato}"

cd "$APP_DIR"

# Read KEY=VALUE lines from the env file without sourcing it.
env_val() { grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr -d '"' || true; }
DB_USER=$(env_val POSTGRES_USER); DB_USER="${DB_USER:-medusa}"
DB_NAME=$(env_val POSTGRES_DB);   DB_NAME="${DB_NAME:-medusa}"

COMPOSE_FILE="${COMPOSE_FILE:-$(env_val BACKUP_COMPOSE_FILE)}"; COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.strato.yml}"
BACKUP_DIR="${BACKUP_DIR:-$(env_val BACKUP_LOCAL_DIR)}";       BACKUP_DIR="${BACKUP_DIR:-db-backups}"
# Relative paths resolve under $HOME, never inside the repo checkout.
case "$BACKUP_DIR" in /*) ;; *) BACKUP_DIR="$HOME/$BACKUP_DIR" ;; esac
RETENTION_DAYS="${RETENTION_DAYS:-$(env_val BACKUP_RETENTION_DAYS)}"; RETENTION_DAYS="${RETENTION_DAYS:-14}"

# S3 upload config (BACKUP_-prefixed in the env file so the plain AWS_* names
# never reach the app containers via env_file). Upload is skipped if unset.
S3_BUCKET=$(env_val BACKUP_S3_BUCKET)
S3_PREFIX=$(env_val BACKUP_S3_PREFIX); S3_PREFIX="${S3_PREFIX:-db_backup}"
S3_REGION=$(env_val BACKUP_AWS_REGION); S3_REGION="${S3_REGION:-eu-central-1}"
S3_KEY_ID=$(env_val BACKUP_AWS_ACCESS_KEY_ID)
S3_SECRET=$(env_val BACKUP_AWS_SECRET_ACCESS_KEY)

# Use `docker compose` if available, fall back to legacy `docker-compose`.
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
fi

mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y-%m-%d_%H%M)
OUT="$BACKUP_DIR/${DB_NAME}_${STAMP}.dump"

# -T: no TTY (required under cron). pg_dump runs inside the container over the
# local socket, so no password is needed. Write to a temp file first so a
# failed dump never leaves a truncated file with a valid name.
"${COMPOSE[@]}" exec -T postgres pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc > "$OUT.part"
mv "$OUT.part" "$OUT"

# Sanity check: an empty file means something went wrong despite exit 0.
if [ ! -s "$OUT" ]; then
  echo "ERROR: dump file is empty: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi

# Prune old snapshots.
find "$BACKUP_DIR" -name "${DB_NAME}_*.dump" -type f -mtime +"$RETENTION_DAYS" -delete
rm -f "$BACKUP_DIR"/*.part

echo "OK: $(date '+%F %T') wrote $OUT ($(du -h "$OUT" | cut -f1))"

# ── Upload to S3 (put-only IAM user; bucket lifecycle expires old dumps) ─────
if [ -n "$S3_BUCKET" ] && [ -n "$S3_KEY_ID" ]; then
  S3_URI="s3://$S3_BUCKET/$S3_PREFIX/$(basename "$OUT")"
  export AWS_ACCESS_KEY_ID="$S3_KEY_ID" AWS_SECRET_ACCESS_KEY="$S3_SECRET" AWS_DEFAULT_REGION="$S3_REGION"
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp "$OUT" "$S3_URI" --only-show-errors
  else
    # No aws CLI on the host — use the official CLI image (docker is a given here).
    docker run --rm -v "$BACKUP_DIR":/backups:ro -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION amazon/aws-cli s3 cp "/backups/$(basename "$OUT")" "$S3_URI" --only-show-errors
  fi
  echo "OK: uploaded $S3_URI"
else
  echo "NOTE: BACKUP_S3_BUCKET / BACKUP_AWS_ACCESS_KEY_ID not set in $ENV_FILE — skipped S3 upload"
fi
