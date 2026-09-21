#!/usr/bin/env bash
set -euo pipefail

# Verify and atomically install a pre-built standalone tarball into
# /opt/moreigory/releases/<sha>. Do not compile the app on the runtime host.

if [[ $# -lt 2 ]]; then
  echo "usage: install-release.sh <40-char-sha> <tarball> [sha256-sidecar]" >&2
  exit 1
fi

SHA="$(echo "$1" | tr 'A-F' 'a-f')"
TARBALL="$2"
CHECKSUM_FILE="${3:-$TARBALL.sha256}"
ROOT="${MOREIGORY_ROOT:-/opt/moreigory}"
DEST="$ROOT/releases/$SHA"
INCOMING="$ROOT/releases/.incoming-$SHA-$$"
CURRENT_CANDIDATE="$ROOT/.current-$SHA-$$"
PREVIOUS_CANDIDATE="$ROOT/.previous-$SHA-$$"

cleanup() {
  rm -rf -- "$INCOMING"
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

if [[ ! "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "SHA must be 40 hex chars" >&2
  exit 1
fi

if [[ ! -f "$TARBALL" ]]; then
  echo "tarball not found: $TARBALL" >&2
  exit 1
fi

if [[ ! -f "$CHECKSUM_FILE" ]]; then
  echo "checksum sidecar not found: $CHECKSUM_FILE" >&2
  exit 1
fi

EXPECTED_CHECKSUM="$(awk 'NR == 1 { print $1 }' "$CHECKSUM_FILE")"
if [[ ! "$EXPECTED_CHECKSUM" =~ ^[0-9a-fA-F]{64}$ ]]; then
  echo "checksum sidecar does not start with a SHA-256 digest" >&2
  exit 1
fi
ACTUAL_CHECKSUM="$(sha256sum "$TARBALL" | awk '{ print $1 }')"
if [[ "$ACTUAL_CHECKSUM" != "${EXPECTED_CHECKSUM,,}" ]]; then
  echo "artifact checksum mismatch" >&2
  exit 1
fi

if [[ -e "$DEST" || -L "$DEST" ]]; then
  echo "immutable release already exists: $DEST" >&2
  exit 1
fi
for pointer in "$ROOT/current" "$ROOT/previous"; do
  if [[ -e "$pointer" && ! -L "$pointer" ]]; then
    echo "release pointer is not a symlink: $pointer" >&2
    exit 1
  fi
done

while IFS= read -r member; do
  normalized="${member#./}"
  if [[ "$member" == /* || "/$normalized/" == *"/../"* ]]; then
    echo "artifact contains an unsafe path: $member" >&2
    exit 1
  fi
done < <(tar -tzf "$TARBALL")

mkdir -p "$ROOT/releases" "$INCOMING"
tar --no-same-owner --no-same-permissions -xzf "$TARBALL" -C "$INCOMING"

node - "$INCOMING/RELEASE.json" "$SHA" <<'NODE'
const { readFileSync } = require("node:fs");
const [manifestPath, expectedSha] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (
  manifest.artifactVersion !== 1 ||
  manifest.layout !== "next-standalone" ||
  manifest.nodeMajor !== 24 ||
  manifest.sha !== expectedSha
) {
  throw new Error("release manifest does not match the artifact contract");
}
NODE

test -f "$INCOMING/server.js"
test -d "$INCOMING/.next/static"
test -d "$INCOMING/public"
mv "$INCOMING" "$DEST"

if [[ -L "$ROOT/current" ]]; then
  CURRENT_TARGET="$(readlink -f "$ROOT/current" || readlink "$ROOT/current")"
  if [[ -n "$CURRENT_TARGET" && "$CURRENT_TARGET" != "$DEST" ]]; then
    ln -s "$CURRENT_TARGET" "$PREVIOUS_CANDIDATE"
    mv -Tf "$PREVIOUS_CANDIDATE" "$ROOT/previous"
  fi
fi

ln -s "$DEST" "$CURRENT_CANDIDATE"
mv -Tf "$CURRENT_CANDIDATE" "$ROOT/current"
trap - EXIT
echo "installed $SHA -> $DEST (checksum and manifest PASS; current symlink updated)"
