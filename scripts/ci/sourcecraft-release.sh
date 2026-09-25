#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

ACTUAL_SHA="${SOURCECRAFT_COMMIT_SHA:-$(git rev-parse HEAD)}"
EXPECTED_SHA="${EXPECTED_COMMIT_SHA:-}"
if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-f]{40}$ || "$EXPECTED_SHA" != "$ACTUAL_SHA" ]]; then
  echo "Release refused: expected_commit_sha must equal checked-out full SHA (${ACTUAL_SHA})." >&2
  exit 1
fi
if [[ ! "${GATE_RUN_SLUG:-}" =~ ^[0-9]+$ ]]; then
  echo "Release refused: gate_run_slug must identify the API-verified green Merge Gate." >&2
  exit 1
fi
if [[ ! "${PREVIOUS_RELEASE_SHA:-}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Release refused: previous_release_sha must be a full rollback SHA." >&2
  exit 1
fi
if [[ ! "${STORE_RELEASE_TAG:-}" =~ ^[a-z0-9][a-z0-9._-]{2,127}$ ]]; then
  echo "Release refused: store_release_tag is invalid." >&2
  exit 1
fi
if [[ ! "${TARGET_SERVER_URL:-}" =~ ^https?://[^/]+$ ]]; then
  echo "Release refused: target_server_url must be an exact public HTTP(S) origin." >&2
  exit 1
fi
export NEXT_PUBLIC_SERVER_URL="$TARGET_SERVER_URL"

corepack enable
[[ "$(node -p 'process.versions.node')" == "24.20.0" ]]
corepack prepare pnpm@11.5.1 --activate
[[ "$(pnpm --version)" == "11.5.1" ]]

pnpm verify:sourcecraft-contract
pnpm install --frozen-lockfile --prefer-offline --reporter=append-only

# Build exactly once; runtime proof and packaging consume the same output.
pnpm verify:risk:runtime-release

node -e "require('node:fs').rmSync('dist/sourcecraft-release', { recursive: true, force: true })"
mkdir -p dist/sourcecraft-release
node scripts/pack-release.mjs \
  --from . \
  --sha "$ACTUAL_SHA" \
  --out dist/sourcecraft-release/release \
  > dist/sourcecraft-release/PACK_RESULT.json
node scripts/write-release-evidence.mjs \
  --artifact dist/sourcecraft-release/release.tar.gz \
  --sha "$ACTUAL_SHA" \
  --gate-run "$GATE_RUN_SLUG" \
  --previous-sha "$PREVIOUS_RELEASE_SHA" \
  --store-release-tag "$STORE_RELEASE_TAG" \
  --out dist/sourcecraft-release/RELEASE_EVIDENCE.json

echo "Release unit prepared once for ${ACTUAL_SHA}; production not touched."
