#!/usr/bin/env bash
#
# translation-source.sh — print a product's translatable source fields (German)
# as JSON, so a translated `translation` upsert can be generated.
#
# Usage:
#   ./translation-source.sh <product_id>
#
# Database:
#   - defaults to local  (postgres://postgres:postgres@localhost:5432/medusa-v2)
#   - for prod, export DATABASE_URL first, e.g.:
#       export DATABASE_URL="$(grep -E '^DATABASE_URL=' ~/krile_medusa/.env.aws | cut -d= -f2-)"
#
# Workflow:
#   1. Run this with a product id (locally or on the prod box).
#   2. Give the JSON output to Claude with a target locale, e.g.
#        "translate this to en-US"  (or fr-FR / it-IT / ru-RU)
#   3. Claude returns a ready-to-run upsert into the `translation` table.

set -euo pipefail

PID="${1:-}"
if [ -z "$PID" ]; then
  echo "usage: ./translation-source.sh <product_id>" >&2
  exit 1
fi
# product ids look like prod_XXXX — reject anything else (avoids SQL injection).
if ! printf '%s' "$PID" | grep -Eq '^prod_[A-Za-z0-9]+$'; then
  echo "error: '$PID' is not a valid product id (expected prod_...)" >&2
  exit 1
fi

DBURL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/medusa-v2}"

SQL="
SELECT json_build_object(
  'id', p.id,
  'handle', p.handle,
  'title', p.title,
  'subtitle', p.subtitle,
  'description', p.description,
  'material', p.material,
  'existing_locales', (
    SELECT json_agg(locale_code ORDER BY locale_code)
    FROM translation
    WHERE reference = 'product' AND reference_id = p.id AND deleted_at IS NULL
  )
)
FROM product p
WHERE p.id = '$PID' AND p.deleted_at IS NULL;
"

# Use local psql if present, otherwise a throwaway postgres client container.
if command -v psql >/dev/null 2>&1; then
  psql "$DBURL" -t -A -c "$SQL"
else
  docker run --rm -i postgres:17 psql "$DBURL" -t -A -c "$SQL"
fi
