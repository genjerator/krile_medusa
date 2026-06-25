#!/usr/bin/env bash
#
# status.sh — quick read-only health snapshot of the Medusa prod box.
# Usage:  ./status.sh            (uses docker-compose.aws.yml next to this script)
#         COMPOSE_FILE=docker-compose.awsec2.yml ./status.sh
#
# Safe to run anytime: it only reads, never changes anything.

set -uo pipefail

# --- resolve compose file + command -----------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-$SCRIPT_DIR/docker-compose.aws.yml}"
if docker compose version >/dev/null 2>&1; then
  DC="docker compose -f $COMPOSE_FILE"
else
  DC="docker-compose -f $COMPOSE_FILE"
fi

hr() { printf '\n\033[1;36m== %s ==\033[0m\n' "$1"; }

# --- host -------------------------------------------------------------------
hr "HOST"
uptime
echo
echo "Memory / swap:"; command -v free >/dev/null 2>&1 && free -h || echo "  (free not available on this host)"
echo
echo "Disk (root):"; df -h / | sed -n '1,2p'

# --- containers -------------------------------------------------------------
hr "CONTAINERS"
$DC ps

hr "RESOURCE USAGE (one-shot)"
PROJECT_IDS=$($DC ps -q 2>/dev/null)
if [ -n "$PROJECT_IDS" ]; then
  docker stats --no-stream --format \
    "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" $PROJECT_IDS 2>/dev/null
else
  echo "  (no running containers for this compose project)"
fi

# --- medusa backend ---------------------------------------------------------
hr "MEDUSA HEALTH"
if $DC exec -T medusa wget -qO- --timeout=5 http://localhost:9000/health 2>/dev/null; then
  printf '  -> backend responding on :9000/health\n'
else
  printf '\033[1;31m  -> backend NOT responding on :9000/health\033[0m\n'
fi
echo "REDIS_URL seen by medusa:"
$DC exec -T medusa printenv REDIS_URL 2>/dev/null || echo "  (REDIS_URL not set — running in-memory)"

# --- redis ------------------------------------------------------------------
hr "REDIS"
if $DC exec -T redis redis-cli ping >/dev/null 2>&1; then
  used=$($DC exec -T redis redis-cli info memory 2>/dev/null | tr -d '\r' | awk -F: '/used_memory_human/{print $2}')
  maxh=$($DC exec -T redis redis-cli info memory 2>/dev/null | tr -d '\r' | awk -F: '/maxmemory_human/{print $2}')
  clients=$($DC exec -T redis redis-cli info clients 2>/dev/null | tr -d '\r' | awk -F: '/connected_clients/{print $2}')
  evicted=$($DC exec -T redis redis-cli info stats 2>/dev/null | tr -d '\r' | awk -F: '/evicted_keys/{print $2}')
  hits=$($DC exec -T redis redis-cli info stats 2>/dev/null | tr -d '\r' | awk -F: '/keyspace_hits/{print $2}')
  misses=$($DC exec -T redis redis-cli info stats 2>/dev/null | tr -d '\r' | awk -F: '/keyspace_misses/{print $2}')
  keys=$($DC exec -T redis redis-cli dbsize 2>/dev/null | tr -d '\r')
  policy=$($DC exec -T redis redis-cli config get maxmemory-policy 2>/dev/null | tr -d '\r' | tail -1)

  printf '  memory used : %s / %s   (policy: %s)\n' "${used:-?}" "${maxh:-?}" "${policy:-?}"
  printf '  keys        : %s\n' "${keys:-?}"
  printf '  clients     : %s\n' "${clients:-?}"
  printf '  cache hits  : %s   misses: %s\n' "${hits:-?}" "${misses:-?}"
  if [ "${evicted:-0}" != "0" ] && [ -n "${evicted:-}" ]; then
    printf '\033[1;33m  evicted_keys: %s  (Redis is hitting the memory cap — consider raising it)\033[0m\n' "$evicted"
  else
    printf '  evicted_keys: %s  (never hit the cap)\n' "${evicted:-0}"
  fi
  echo "  top key namespaces:"
  $DC exec -T redis redis-cli --scan --count 300 2>/dev/null \
    | sed 's/:[^:]*$//' | sort | uniq -c | sort -rn | head -8 | sed 's/^/    /'
else
  printf '\033[1;31m  -> Redis NOT reachable\033[0m\n'
fi

hr "DONE"
