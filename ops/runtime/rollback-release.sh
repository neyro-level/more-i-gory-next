#!/usr/bin/env bash
set -euo pipefail

# Atomic rollback: current → previous release, restart, smoke.
# Does not rebuild the application.

ROOT="/opt/moreigory"
SMOKE_URL="${MOREIGORY_SMOKE_URL:-http://127.0.0.1:3000/api/health}"

if [[ ! -L "$ROOT/previous" ]]; then
  echo "no previous release pointer at $ROOT/previous" >&2
  exit 1
fi

PREVIOUS_TARGET="$(readlink -f "$ROOT/previous" || readlink "$ROOT/previous")"
if [[ ! -f "$PREVIOUS_TARGET/server.js" ]]; then
  echo "previous release is missing server.js" >&2
  exit 1
fi

if [[ -L "$ROOT/current" ]]; then
  CURRENT_TARGET="$(readlink -f "$ROOT/current" || readlink "$ROOT/current")"
  if [[ -n "$CURRENT_TARGET" && "$CURRENT_TARGET" != "$PREVIOUS_TARGET" ]]; then
    ln -sfn "$CURRENT_TARGET" "$ROOT/previous"
  fi
fi

ln -sfn "$PREVIOUS_TARGET" "$ROOT/current"
systemctl restart moreigory
curl -fsS -o /dev/null "$SMOKE_URL"
echo "rolled back current -> $PREVIOUS_TARGET"
