#!/usr/bin/env bash
set -euo pipefail

# Unpack a pre-built standalone tarball into /opt/moreigory/releases/<sha>.
# Do not compile the app on the runtime host.

if [[ $# -lt 2 ]]; then
  echo "usage: install-release.sh <40-char-sha> <tarball>" >&2
  exit 1
fi

SHA="$(echo "$1" | tr 'A-F' 'a-f')"
TARBALL="$2"
ROOT="/opt/moreigory"
DEST="$ROOT/releases/$SHA"

if [[ ! "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "SHA must be 40 hex chars" >&2
  exit 1
fi

if [[ ! -f "$TARBALL" ]]; then
  echo "tarball not found: $TARBALL" >&2
  exit 1
fi

mkdir -p "$DEST"
tar -xf "$TARBALL" -C "$DEST"
test -f "$DEST/server.js"
test -f "$DEST/RELEASE.json"
grep -q "$SHA" "$DEST/RELEASE.json"

if [[ -L "$ROOT/current" ]]; then
  CURRENT_TARGET="$(readlink -f "$ROOT/current" || readlink "$ROOT/current")"
  if [[ -n "$CURRENT_TARGET" && "$CURRENT_TARGET" != "$DEST" ]]; then
    ln -sfn "$CURRENT_TARGET" "$ROOT/previous"
  fi
fi

ln -sfn "$DEST" "$ROOT/current"
echo "installed $SHA -> $DEST (current symlink updated)"
