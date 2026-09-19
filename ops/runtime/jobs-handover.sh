#!/usr/bin/env bash
set -euo pipefail

# Jobs owner handover (TASK 13.8).
# Sequence:
#   new runtime JOBS_AUTORUN=false
#   → readiness
#   → stop old jobs owner
#   → assert no owner
#   → start new owner JOBS_AUTORUN=true
#   → health
# Staging must not promote to JOBS_AUTORUN=true (ingest freeze).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ROOT="/opt/moreigory"
SMOKE_URL="${MOREIGORY_SMOKE_URL:-http://127.0.0.1:3000/api/health}"
CONTOUR="$(systemctl show-environment 2>/dev/null | sed -n 's/^AMS_RUNTIME_CONTOUR=//p' || true)"
if [[ -z "$CONTOUR" ]]; then
  CONTOUR="$(grep -E '^Environment=AMS_RUNTIME_CONTOUR=' /etc/systemd/system/moreigory.service | cut -d= -f3 || true)"
fi

assert_none() {
  node "$REPO_ROOT/scripts/assert-one-jobs-owner.mjs" --mode=handover-none --values="${1:-false}"
}

assert_steady() {
  node "$REPO_ROOT/scripts/assert-one-jobs-owner.mjs" --mode=steady --values="${1:-false,true}"
}

case "${1:-}" in
  assert-none)
    assert_none "${2:-false}"
    ;;
  assert-steady)
    if [[ "$CONTOUR" == "staging" ]]; then
      echo "staging contour refuses JOBS_AUTORUN=true (ingest freeze)" >&2
      exit 1
    fi
    assert_steady "${2:-false,true}"
    ;;
  smoke)
    curl -fsS -o /dev/null "$SMOKE_URL"
    echo "jobs-handover smoke PASS"
    ;;
  *)
    echo "usage: jobs-handover.sh assert-none|assert-steady|smoke" >&2
    exit 1
    ;;
esac
