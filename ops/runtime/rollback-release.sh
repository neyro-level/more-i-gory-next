#!/usr/bin/env bash
set -euo pipefail

# Atomic rollback: current → previous release, restart, smoke.
# Does not rebuild the application.

ROOT="/opt/moreigory"
SMOKE_URL="${MOREIGORY_SMOKE_URL:-http://127.0.0.1:3000/api/health}"
ROOT="${MOREIGORY_ROOT:-$ROOT}"
CURRENT_CANDIDATE="$ROOT/.rollback-current-$$"
PREVIOUS_CANDIDATE="$ROOT/.rollback-previous-$$"

cleanup() {
  rm -f -- "$CURRENT_CANDIDATE" "$PREVIOUS_CANDIDATE"
}
trap cleanup EXIT

if [[ "$ROOT" != "/opt/moreigory" && "${MOREIGORY_ALLOW_NONCANONICAL_ROOT:-}" != "1" ]]; then
  echo "non-canonical root requires MOREIGORY_ALLOW_NONCANONICAL_ROOT=1" >&2
  exit 1
fi
if [[ "$ROOT" != "/opt/moreigory" && "$ROOT" != /tmp/* ]]; then
  echo "non-canonical root is allowed only below /tmp" >&2
  exit 1
fi
if [[ ! "$SMOKE_URL" =~ ^http://127\.0\.0\.1:[0-9]{2,5}/api/health/?$ ]]; then
  echo "rollback smoke URL must be the loopback health endpoint" >&2
  exit 1
fi

if [[ ! -L "$ROOT/previous" ]]; then
  echo "no previous release pointer at $ROOT/previous" >&2
  exit 1
fi

PREVIOUS_TARGET="$(readlink -f "$ROOT/previous" || readlink "$ROOT/previous")"
if [[ ! -L "$ROOT/current" ]]; then
  echo "no current release pointer at $ROOT/current" >&2
  exit 1
fi
CURRENT_TARGET="$(readlink -f "$ROOT/current" || readlink "$ROOT/current")"

validate_release() {
  local release="$1"
  local label="$2"
  local expected_sha
  expected_sha="$(basename "$release")"
  if [[ ! "$expected_sha" =~ ^[0-9a-f]{40}$ || ! -f "$release/server.js" || ! -f "$release/RELEASE.json" ]]; then
    echo "$label release is incomplete or has an invalid path" >&2
    exit 1
  fi
  node - "$release/RELEASE.json" "$expected_sha" <<'NODE'
const { readFileSync } = require("node:fs");
const [manifestPath, expectedSha] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const versioned = manifest.artifactVersion === 1 && manifest.nodeMajor === 24;
const legacy = manifest.artifactVersion == null && manifest.nodeMajor == null;
if ((!versioned && !legacy) || manifest.layout !== "next-standalone" || manifest.sha !== expectedSha) {
  throw new Error("rollback release manifest mismatch");
}
NODE
}

validate_release "$CURRENT_TARGET" "current"
validate_release "$PREVIOUS_TARGET" "previous"
if [[ "$CURRENT_TARGET" == "$PREVIOUS_TARGET" ]]; then
  echo "current and previous point to the same release" >&2
  exit 1
fi

ln -s "$PREVIOUS_TARGET" "$CURRENT_CANDIDATE"
mv -Tf "$CURRENT_CANDIDATE" "$ROOT/current"

if systemctl restart moreigory && curl -fsS -o /dev/null "$SMOKE_URL"; then
  ln -s "$CURRENT_TARGET" "$PREVIOUS_CANDIDATE"
  mv -Tf "$PREVIOUS_CANDIDATE" "$ROOT/previous"
else
  echo "rollback smoke failed; restoring the original current release" >&2
  ln -s "$CURRENT_TARGET" "$CURRENT_CANDIDATE"
  mv -Tf "$CURRENT_CANDIDATE" "$ROOT/current"
  systemctl restart moreigory || true
  exit 1
fi

trap - EXIT
echo "rolled back current -> $PREVIOUS_TARGET"
